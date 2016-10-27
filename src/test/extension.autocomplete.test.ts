
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.


// Place this right on top
import { initialize, PYTHON_PATH, closeActiveWindows } from './initialize';
// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { EOL } from 'os';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';
import * as settings from '../client/common/configSettings';

let pythonSettings = settings.PythonSettings.getInstance();
let autoCompPath = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'autocomp');
const fileOne = path.join(autoCompPath, 'one.py');
const fileTwo = path.join(autoCompPath, 'two.py');
const fileThree = path.join(autoCompPath, 'three.py');
const fileEncoding = path.join(autoCompPath, 'four.py');
const fileEncodingUsed = path.join(autoCompPath, 'five.py');
const fileHover = path.join(autoCompPath, 'hoverTest.py');

suite('Autocomplete', () => {
    suiteSetup(done => {
        initialize().then(() => {
            pythonSettings.pythonPath = PYTHON_PATH;
            done();
        }, done);
    });

    suiteTeardown(done => {
        closeActiveWindows().then(done, done);
    });
    teardown(done => {
        closeActiveWindows().then(done, done);
    });

    test('For "sys."', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(3, 10);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then((list: { isIncomplete: boolean, items: vscode.CompletionItem[] }) => {
            assert.notEqual(list.items.filter(item => item.label === 'api_version').length, 0, 'api_version not found');
            assert.notEqual(list.items.filter(item => item.label === 'argv').length, 0, 'argv not found');
            assert.notEqual(list.items.filter(item => item.label === 'prefix').length, 0, 'prefix not found');
        }).then(done, done);
    });

    test('For custom class', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 4);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then((list: { isIncomplete: boolean, items: vscode.CompletionItem[] }) => {
            assert.notEqual(list.items.filter(item => item.label === 'method1').length, 0, 'method1 not found');
            assert.notEqual(list.items.filter(item => item.label === 'method2').length, 0, 'method2 not found');
        }).then(done, done);
    });

    test('With Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncoding).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(25, 4);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then((list: { isIncomplete: boolean, items: vscode.CompletionItem[] }) => {
            assert.equal(list.items.filter(item => item.label === 'bar').length, 1, 'bar not found');
            const documentation = `bar()${EOL}${EOL}说明 - keep this line, it works${EOL}delete following line, it works${EOL}如果存在需要等待审批或正在执行的任务，将不刷新页面`;
            assert.equal(list.items.filter(item => item.label === 'bar')[0].documentation, documentation, 'unicode documentation is incorrect');
        }).then(done, done);
    });

    test('Across files With Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncodingUsed).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 5);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then((list: { isIncomplete: boolean, items: vscode.CompletionItem[] }) => {
            assert.equal(list.items.filter(item => item.label === 'Foo').length, 1, 'Foo not found');
            assert.equal(list.items.filter(item => item.label === 'Foo')[0].documentation, '说明', 'Foo unicode documentation is incorrect');

            assert.equal(list.items.filter(item => item.label === 'showMessage').length, 1, 'showMessage not found');
            const documentation = `showMessage()${EOL}${EOL}Кюм ут жэмпэр пошжим льаборэж, коммюны янтэрэсщэт нам ед, декта игнота ныморэ жят эи. ${EOL}Шэа декам экшырки эи, эи зыд эррэм докэндё, векж факэтэ пэрчыквюэрёж ку.`;
            assert.equal(list.items.filter(item => item.label === 'showMessage')[0].documentation, documentation, 'showMessage unicode documentation is incorrect');
        }).then(done, done);
    });
});

suite('Code Definition', () => {
    suiteSetup(done => {
        initialize().then(() => {
            pythonSettings.pythonPath = PYTHON_PATH;
            done();
        }, done);
    });

    suiteTeardown(done => {
        closeActiveWindows().then(done, done);
    });
    teardown(done => {
        closeActiveWindows().then(done, done);
    });

    test('Go to method', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 5);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, uri: vscode.Uri }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '17,8', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '17,8', 'End position is incorrect');
        }).then(done, done);
    });

    test('Across files', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileThree).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 5);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, uri: vscode.Uri }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '0,6', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '0,6', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileTwo, 'File is incorrect');
        }).then(done, done);
    });

    test('With Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncoding).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(25, 6);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, uri: vscode.Uri }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '10,8', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '10,8', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileEncoding, 'File is incorrect');
        }).then(done, done);
    });

    test('Across files with Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncodingUsed).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 11);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, uri: vscode.Uri }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '18,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '18,4', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileEncoding, 'File is incorrect');
        }).then(done, done);
    });
});

suite('Hover Definition', () => {
    suiteSetup(done => {
        initialize().then(() => {
            pythonSettings.pythonPath = PYTHON_PATH;
            done();
        }, done);
    });

    suiteTeardown(done => {
        closeActiveWindows().then(done, done);
    });
    teardown(done => {
        closeActiveWindows().then(done, done);
    });

    test('Method', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 5);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '30,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '30,11', 'End position is incorrect');
            assert.equal(def[0].contents.length, 2, 'Invalid content items');
            assert.equal(def[0].contents[0].value, 'def method1(self)', 'function signature incorrect');
            assert.equal(def[0].contents[1], `This is method1`, 'Invalid conents');
        }).then(done, done);
    });

    test('Across files', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileThree).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 12);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '1,9', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,12', 'End position is incorrect');
            assert.equal(def[0].contents[0].value, 'def fun()', 'function signature incorrect');
            assert.equal(def[0].contents[1], `This is fun`, 'Invalid conents');
        }).then(done, done);
    });

    test('With Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncoding).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(25, 6);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '25,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '25,7', 'End position is incorrect');
            assert.equal(def[0].contents[0].value, 'def bar()', 'function signature incorrect');
            const documentation = `说明 - keep this line, it works${EOL}delete following line, it works${EOL}如果存在需要等待审批或正在执行的任务，将不刷新页面`;
            assert.equal(def[0].contents[1], documentation, 'Invalid conents');
        }).then(done, done);
    });

    test('Across files with Unicode Characters', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileEncodingUsed).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 11);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '1,5', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,16', 'End position is incorrect');
            assert.equal(def[0].contents[0].value, 'def showMessage()', 'Invalid content items');
            const documentation = `Кюм ут жэмпэр пошжим льаборэж, коммюны янтэрэсщэт нам ед, декта игнота ныморэ жят эи. ${EOL}Шэа декам экшырки эи, эи зыд эррэм докэндё, векж факэтэ пэрчыквюэрёж ку.`;
            assert.equal(def[0].contents[1], documentation, 'Invalid conents');
        }).then(done, done);
    });

    test('Nothing for keywords (class)', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(5, 1);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 0, 'Definition lenght is incorrect');
        }).then(done, done);
    });

    test('Nothing for keywords (for)', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(3, 1);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 0, 'Definition lenght is incorrect');
        }).then(done, done);
    });

    test('Highlighting Class', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(11, 15);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '11,12', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '11,18', 'End position is incorrect');
            assert.equal(def[0].contents[0].value, 'class Random(self, x=None)', 'Invalid content items');
            const documentation = `Random number generator base class used by bound module functions.${EOL}${EOL}` +
                `Used to instantiate instances of Random to get generators that don't${EOL}` +
                `share state.${EOL}${EOL}` +
                `Class Random can also be subclassed if you want to use a different basic${EOL}` +
                `generator of your own devising: in that case, override the following${EOL}` +
                `methods:  random(), seed(), getstate(), and setstate().${EOL}` +
                `Optionally, implement a getrandbits() method so that randrange()${EOL}` +
                `can cover arbitrarily large ranges.`

            assert.equal(def[0].contents[1], documentation, 'Invalid conents');
        }).then(done, done);
    });

    test('Highlight Method', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(12, 10);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '12,5', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '12,12', 'End position is incorrect');
            assert.equal(def[0].contents[0].value, 'def randint(self, a, b)', 'Invalid content items');
            const documentation = `Return random integer in range [a, b], including both end points.${EOL}        `;
            assert.equal(def[0].contents[1], documentation, 'Invalid conents');
        }).then(done, done);
    });

    test('Highlight Multiline Method Signature', done => {
        let textEditor: vscode.TextEditor;
        let textDocument: vscode.TextDocument;
        return vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(15, 10);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then((def: [{ range: vscode.Range, contents: { language: string, value: string }[] }]) => {
            assert.equal(def.length, 1, 'Definition lenght is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '15,2', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '15,10', 'End position is incorrect');
            const signature = `def __init__(self, group=None, target=None, name=None,${EOL}args=(), kwargs=None, verbose=None)`;
            assert.equal(def[0].contents[0].value, signature, 'Invalid content items');
            const documentation = `This constructor should always be called with keyword arguments. Arguments are:${EOL}${EOL}` +
                `*group* should be None; reserved for future extension when a ThreadGroup${EOL}` +
                `class is implemented.${EOL}${EOL}` +
                `*target* is the callable object to be invoked by the run()${EOL}` +
                `method. Defaults to None, meaning nothing is called.${EOL}${EOL}` +
                `*name* is the thread name. By default, a unique name is constructed of${EOL}` +
                `the form "Thread-N" where N is a small decimal number.${EOL}${EOL}` +
                `*args* is the argument tuple for the target invocation. Defaults to ().${EOL}${EOL}` +
                `*kwargs* is a dictionary of keyword arguments for the target${EOL}` +
                `invocation. Defaults to {}.${EOL}${EOL}` +
                `If a subclass overrides the constructor, it must make sure to invoke${EOL}` +
                `the base class constructor (Thread.__init__()) before doing anything${EOL}` +
                `else to the thread.`;
            assert.equal(def[0].contents[1], documentation, 'Invalid conents');
        }).then(done, done);
    });
});