'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
//import * as iar from './iar2gcc';
const IAR2GCC = require('./iar2gcc');

let iar2gcc: any = undefined;

let Path: any = undefined;
let ConfigJSON: any = undefined;


function preprocess(input:string) {
    return input.split("${workspaceRoot}").join(Path.toString());
}


export function activate(context: vscode.ExtensionContext) {

    if(!vscode.workspace.rootPath) {
        return;
    } else {
        Path = vscode.workspace.rootPath;
        ConfigJSON = Path + "\\.vscode\\iar.json";
    }

    let disposable = vscode.commands.registerCommand('main.run', function() {

        vscode.window.showInformationMessage("iar2gcc start procesing");

        if(fs.existsSync(ConfigJSON)) {
            let obj = JSON.parse(fs.readFileSync(ConfigJSON).toString());
            
            if(obj["project"] && obj["config"]) {
                if(!iar2gcc) {
                    iar2gcc = new IAR2GCC(Path, preprocess(obj["project"]), preprocess(obj["config"]));
                }
            
                iar2gcc.run();
                
                if(iar2gcc.in_progress() === true) {
                    console.log('iar2gcc launched successfully!');
                }
            }
        }
    });

    context.subscriptions.push(disposable);
    
}

export function deactivate() {
}