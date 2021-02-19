import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

import { createProject } from "./main";
const { version, description } = require("../package.json");

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            "--git": Boolean,
            "--yes": Boolean,
            "--install": Boolean,
            "--v": Boolean,
            "--desc": Boolean,
            "-g": "--git",
            "-y": "--yes",
            "-i": "--install",
            "-v": "--v",
            "-d": "--desc"
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        skipPrompts: args["--yes"] || false,
        git: args["--git"] || false,
        template: args._[0],
        runInstall: args["--install"] || false,
        version: args["--v"] || false,
        description: args["--desc"] || false
    };
}

async function promptForMissingOptions(options) {
    const defaultTemplate = "JavaScript";
    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate
        };
    }
    if (options.help) {
        return {
            ...options,
            template: options.template || defaultTemplate
        };
    }

    const questions = [];
    if (!options.template) {
        questions.push({
            type: "list",
            name: "template",
            message: "Please choose which project template to use",
            choices: [
                "JavaScript",
                "TypeScript",
                "express-typescript-boilerplate"
            ],
            default: defaultTemplate
        });
    }

    if (!options.git) {
        questions.push({
            type: "confirm",
            name: "git",
            message: "Initialize a git repository?",
            default: false
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    };
}

export async function cli(args) {
    try {
        figlet(
            "DOCK",
            {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default"
            },
            async (error, data) => {
                if (error) {
                    return process.exit(1);
                }
                console.log(chalk.blue(data));
                let options = parseArgumentsIntoOptions(args);
                if (options.version) {
                    console.log(chalk.green.bold(version));
                } else if (options.description) {
                    console.log(chalk.green.bold(description));
                } else {
                    options = await promptForMissingOptions(options);
                    await createProject(options);
                }
            }
        );
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
