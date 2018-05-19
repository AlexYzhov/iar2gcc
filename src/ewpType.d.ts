import * as vscode from 'vscode';

declare module ewpType {
    /////////////////////////////

    //补充类型
   /* export interface Device {
        
    }*/

    /////////////////////////////

    export interface Toolchain {
        name: string;
    }

    export interface Option {
        name: string;
        version?: string;
        state: string[];
    }

    export interface Data {
        version: number;
        wantNonLocal: number;
        debug: number;
        options: Option[];

        GetOption(name:string): Option;
    }

    export interface Setting {
        name: string;
        archiveVersion: string;
        data: Data;
    }

    export interface Configuration {
        name: string;
        toolchain: Toolchain;
        debug: string;
        settings: Setting[];

        GetSetting(name:string): Setting;
    }

    export interface File {
        name: string;
    }

    export interface Group3 {
        name: string;
        file: any;
    }

    export interface Group2 {
        name: string;
        file: File[];
        group: Group3[];
    }

    export interface Group {
        name: string;
        group: Group2[];
        file: any;
    }

    export interface File2 {
        name: string;
    }

    export interface Project {
        fileVersion: string;
        configuration: Configuration[];
        group: Group[];
        file: File2;

        GetConfiguration(name:string): Configuration;
    }

    export interface RootObject {
        project: Project;
    }
}

declare const ewpType: ewpType.RootObject;
//declare const projectType: ewpTypeModule.Project;
//declare const configurationType: ewpTypeModule.Configuration;
//declare const dataType: ewpTypeModule.Data;
//declare const optionType: ewpTypeModule.Option;

export default ewpType;