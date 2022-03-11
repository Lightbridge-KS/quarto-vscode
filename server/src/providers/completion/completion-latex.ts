/* --------------------------------------------------------------------------------------------
 * Copyright (c) RStudio, PBC. All rights reserved.
 * Copyright (c) 2016 James Yu
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

// based on https://github.com/James-Yu/LaTeX-Workshop/blob/master/src/providers/completion.ts

import { Position, TextDocument } from "vscode-languageserver-textdocument";

import {
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Range,
} from "vscode-languageserver/node";

import { isLatexPosition } from "../../core/markdown/markdown";

interface LatexCommand {
  command: string;
  snippet?: string;
  detail?: string;
  documentation?: string;
}
import mathjaxImport from "./mathjax.json";
const kMathjaxCommands = mathjaxImport as string[];

import mathjaxCompletions from "./mathjax-completions.json";
const kMathjaxCompletions = mathjaxCompletions as Record<string, LatexCommand>;
for (const key of Object.keys(kMathjaxCompletions)) {
  if (key.match(/\{.*?\}/)) {
    const ent = kMathjaxCompletions[key];
    const newKey = key.replace(/\{.*?\}/, "");
    delete kMathjaxCompletions[key];
    kMathjaxCompletions[newKey] = ent;
  }
}

// for latex we complete the subset of commands supported by mathjax
// (as those will work universally in pdf and html)
export async function latexCompletions(
  doc: TextDocument,
  pos: Position,
  completionContext?: CompletionContext
): Promise<CompletionItem[] | null> {
  // validate trigger
  const trigger = completionContext?.triggerCharacter;
  if (trigger && !["\\"].includes(trigger)) {
    return null;
  }

  // check for latex position
  if (!isLatexPosition(doc, pos)) {
    return null;
  }

  // scan back from the cursor to see if there is a \
  const line = doc
    .getText(Range.create(pos.line, 0, pos.line + 1, 0))
    .trimEnd();
  const text = line.slice(0, pos.character);
  const backslashPos = text.lastIndexOf("\\");
  const spacePos = text.lastIndexOf(" ");
  if (backslashPos !== -1 && backslashPos > spacePos) {
    const token = text.slice(backslashPos + 1);
    const completions: CompletionItem[] = kMathjaxCommands
      .filter((cmd) => cmd.startsWith(token))
      .map((cmd) => {
        const mathjaxCompletion = kMathjaxCompletions[cmd];
        if (mathjaxCompletion) {
          return {
            kind: CompletionItemKind.Function,
            label: mathjaxCompletion.command,
            documentation: mathjaxCompletion.documentation,
            detail: mathjaxCompletion.detail,
            insertTextFormat: InsertTextFormat.Snippet,
            insertText: mathjaxCompletion.snippet,
          };
        } else {
          return {
            kind: CompletionItemKind.Function,
            label: cmd,
          };
        }
      });

    if (completions.length > 0) {
      return completions;
    }
  }

  return null;
}
