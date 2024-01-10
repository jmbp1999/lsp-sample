import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    CompletionItem,
    CompletionList,
    ProgressType,
    DidChangeTextDocumentParams,
    DidOpenTextDocumentParams,
    DidCloseTextDocumentParams,
    SemanticTokensParams,
    SemanticTokens,
    SemanticTokensLegend,
    InlineValueParams,
    InlineValue,
    RegistrationParams,
    UnregistrationParams,
    ConfigurationItem,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
        },
    };
    return result;
});

documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

documents.onDidOpen((event) => {
    const document = event.document;
    connection.sendNotification('window/showMessage', [`Text Document Did Open: ${document.uri}`]);
});

documents.onDidClose((event) => {
    console.log("Triggered!");
    const document = event.document;
    connection.sendNotification('window/showMessage', `Text Document Did Close`);
});

connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams) => {
    const completions: CompletionItem[] = [
        { label: '"' },
        { label: '[' },
        { label: ']' },
        { label: '{' },
        { label: '}' },
    ];

    const completionList: CompletionList = {
        isIncomplete: false,
        items: completions,
    };

    return completionList;
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const text = textDocument.getText();

    try { 
        // JSON.parse(text);
        // here i call the api instead of this JSON.parse

        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
    } catch (error) {
        console.warn(error instanceof Error ? error.message : error);
        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: 0 },
                end: textDocument.positionAt(text.length),
            },
            message: `Invalid JSON: ${error}`,
        };

        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [diagnostic] });
    }
}

// Additional features from the Python code
connection.onDidChangeConfiguration((change) => {

});

connection.onRequest('countDownBlocking', () => {
    countDownBlocking();
});

connection.onRequest('countDownNonBlocking', () => {
    countDownNonBlocking();
});

function countDownBlocking() {
    for (let i = 10; i > 0; i--) {
        connection.sendNotification('window/showMessage', [`Counting down... ${i}`]);
        sleep(1000);
    }
}

async function countDownNonBlocking() {
    for (let i = 10; i > 0; i--) {
        connection.sendNotification('window/showMessage', [`Counting down... ${i}`]);
        await sleepAsync(1000);
    }
}


function sleep(ms: number) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function sleepAsync(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

documents.listen(connection);
connection.listen();
