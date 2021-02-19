import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import simpleGit from "simple-git/promise";

const access = promisify(fs.access);
const copy = promisify(ncp);

const expressTypescriptBoilerplateRepo =
    "https://github.com/w3tecch/express-typescript-boilerplate";

/**
 * Copies selected template files to destination folder
 *
 * @param {Object} options
 * @returns
 */
async function copyTemplateFiles(options) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    });
}

/**
 * Exec - run shell command as promise
 *
 * @param {string} command
 * @param {any[]} opts
 * @returns
 */
async function exec(command, opts) {
    return new Promise((resolve, reject) => {
        require("child_process").exec(
            command,
            { stdio: "inherit", ...opts },
            (err, ...values) => {
                if (err) {
                    console.log(
                        chalk.red.bold(
                            "ERROR: =============Installation failed =============\n"
                        ),
                        err
                    );
                    reject(err);
                } else {
                    resolve(...values);
                }
            }
        );
    });
}

/**
 * Clones the given repo in the destination folder
 *
 * @param {Object} options
 * @returns
 */
async function cloneGitRepo(options) {
    console.log(
        `cloning ${options.template} to destination folder ${options.targetDirectory}`
    );
    try {
        await simpleGit().clone(
            expressTypescriptBoilerplateRepo,
            options.targetDirectory
        );
        console.log(
            chalk.green.bold(
                `=============Installing package dependencies=============`
            )
        );
        await exec("npm install", []);
        chalk.green.bold(`=============Installed packages=============`);
        return Promise.resolve(true);
    } catch (error) {
        await simpleGit(options.targetDirector).pull();
        return Promise.reject(false);
    }
}

/**
 * Checks option properties and creates/clones template(selected template option from the CLI input).
 *
 * @param {Object} options
 * @returns
 */
export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd()
    };

    switch (options.template) {
        case "express-typescript-boilerplate":
            await cloneGitRepo(options);
            console.log("clone success", chalk.green.bold("SUCCESS"));
            break;

        default:
            console.log("Copy project files");
            const currentFileUrl = import.meta.url;
            // Get template path.
            const templateDir = path.resolve(
                new URL(currentFileUrl).pathname.substring(
                    new URL(currentFileUrl).pathname.indexOf("/") + 1
                ),
                "../../templates",
                options.template.toLowerCase()
            );
            options.templateDirectory = templateDir;

            try {
                // tests a user's permissions for the file specified by path.
                await access(templateDir, fs.constants.R_OK);
            } catch (err) {
                console.error(
                    "%s Invalid template name",
                    chalk.red.bold("ERROR")
                );
                process.exit(1);
            }
            await copyTemplateFiles(options);
            console.log("%s Project ready", chalk.green.bold("DONE"));
            break;
    }
    return true;
}
