'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as ewpType from '../src/ewpType';

const xml2js = require('xml2js');   // XML-JSON convert lib

class EwpObj{
    project: ewpType.default.Project;

    constructor(ewp:ewpType.default.Project) {
        this.project = ewp;

        this.project.GetConfiguration = function(name:string): any {
            for(var index in this.configuration) {
                if(this.configuration[index]["name"] === name) {
                    return this.configuration[index];
                }
            }
            console.log("constructor start");
        };
        
        this.project.configuration.forEach((config:any) => {
            config.GetSetting = function(name:string): any {
                for(var i in config.settings) {
                    if(config.settings[i]["name"] === name) {
                        return config.settings[i];
                    }
                }
            };

            config.settings.forEach((set:any) => {
                if(set.data.option !== null && set.data.option !== undefined) {
                    set.data.GetOption = function(name:string): any {
                        for(var j in set.data.option) {
                            if(set.data.option[j]["name"] === name) {
                                return set.data.option[j];
                            }
                        }
                    };
                }
            });
                
        });
    }
}

export class IAR2GCC {

    vscworkspace: string;
    projectpath: string;
    config: string;

    ewpJSON: any;
    ewpObj: any;

    device: string;
    options: string[];
    defines: string[];
    includePaths: string[];

    errors: number;
    warnings: number;
    problems: string[];
    
    terminal: any;
    progress: boolean;
    projectname: string;
    
    constructor(vscworkspace:string, projectpath:string, config:string) {
        this.vscworkspace = vscworkspace;
        this.projectpath = projectpath;
        this.config = config;

        this.ewpJSON = vscworkspace + "\\.vscode" + "\\iar_parse.json";
        this.ewpObj = undefined;

        this.device = "";
        this.options = [];
        this.defines = [];
        this.includePaths = [];     //includePaths

        this.errors = -1;
        this.warnings = -1;
        this.problems = [];
        
        this.terminal = undefined;
        this.progress = false;
        this.projectname = '';
    }

    private parse_ewp2json(): boolean {
        let ptr = this;

        if(fs.existsSync(this.projectpath)) {

            xml2js.parseString(fs.readFileSync(ptr.projectpath).toString(), {explicitArray : false}, function(err:string, result:string) {
                let temp = JSON.stringify(result, null, "\t");
                fs.writeFileSync(ptr.ewpJSON, temp);
            });

            ///////////////////////////////////////////////////////////////////////////////////////////////////////

            this.ewpObj = <EwpObj> new EwpObj(JSON.parse(fs.readFileSync(this.ewpJSON).toString())["project"]);

        }
        else {
            vscode.window.showErrorMessage("ERROR: " + "\"" + this.projectpath.split('\\').pop() + "\"" + " not found!");
            return false;
        }

        return true;
    }

    private parse_includePaths() {
        this.ewpObj.project.GetConfiguration(this.config).GetSetting("ICCARM").data.GetOption("CCIncludePath2").state.forEach((array:string)=>{
            let incPath = path.dirname(path.normalize(array.replace("$PROJ_DIR$", path.dirname(this.projectpath)) + "\\"));
            if(this.includePaths.indexOf(incPath) < 0) {
                this.includePaths.push(incPath);
            }
        });

        //console.log(this.includePaths);        
    }

    private parse_defines() {
        this.ewpObj.project.GetConfiguration(this.config).GetSetting("ICCARM").data.GetOption("CCDefines").state.forEach((array:string)=>{
            let def = path.normalize(array);
            if(this.defines.indexOf(def) < 0) {
                this.defines.push(def);
            }
        });

        //console.log(this.defines);
    }

    private parse_options() {
        this.device = path.normalize(this.ewpObj.project.GetConfiguration(this.config).GetSetting("General").data.GetOption("OGChipSelectEditMenu").state).split("\t", 1).toString();
        
        //console.log(this.device);
        if(this.terminal !== undefined) {
            this.terminal.appendLine("Target: " + this.device);
        }
    }

    private parse_project(): boolean {
        if(false === this.parse_ewp2json()) {
            return false;
        }

        this.parse_includePaths();
        this.parse_defines();
        this.parse_options();

        return true;
    }

    private build_database() {
        
    }

    public in_progress() {
        return this.progress;
    }

    public run(): boolean {
        this.progress = true;   // method starts working

        if(!this.terminal) {
            this.terminal = vscode.window.createOutputChannel('iar2gcc');
        }

        this.terminal.show();
        this.terminal.clear();

        if(false === this.parse_project()) {

            return false;
        }

        vscode.workspace.saveAll(false);

        this.progress = false;  // method ends working

        return true;
    }

}

module.exports = IAR2GCC;