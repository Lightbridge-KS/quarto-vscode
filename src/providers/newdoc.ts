/* --------------------------------------------------------------------------------------------
 * Copyright (c) RStudio, PBC. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
  workspace,
  window,
  commands,
  NotebookData,
  NotebookCellData,
  NotebookCellKind,
  WorkspaceEdit,
} from "vscode";
import { kQuartoLanguageId } from "../../server/src/core/doc";
import { Command } from "../core/command";
import { getWholeRange } from "../core/doc";

export function newDocumentCommands(): Command[] {
  return [
    new NewDocumentCommand("quarto.newDocument"),
    new NewDocumentCommand("quarto.fileNewDocument"),
    new NewPresentationCommand("quarto.newPresentation"),
    new NewPresentationCommand("quarto.fileNewPresentation"),
    new NewNotebookCommand("quarto.newNotebook"),
    new NewNotebookCommand("quarto.fileNewNotebook"),
  ];
}

class NewNotebookCommand implements Command {
  public readonly id: string;
  constructor(cmdId: string) {
    this.id = cmdId;
  }
  async execute(): Promise<void> {
    const cells: NotebookCellData[] = [];
    cells.push(
      new NotebookCellData(
        NotebookCellKind.Code,
        kUntitledHtml.trimEnd(),
        "raw"
      )
    );
    cells.push(new NotebookCellData(NotebookCellKind.Code, "1 + 1", "python"));
    const nbData = new NotebookData(cells);
    let notebook = await workspace.openNotebookDocument(
      "jupyter-notebook",
      nbData
    );
    await commands.executeCommand(
      "vscode.openWith",
      notebook.uri,
      "jupyter-notebook"
    );

    const cell = notebook.cellAt(1);
    const edit = new WorkspaceEdit();
    edit.replace(cell.document.uri, getWholeRange(cell.document), "");

    await workspace.applyEdit(edit);
  }
}

abstract class NewFileCommand implements Command {
  public readonly id: string;
  constructor(cmdId: string) {
    this.id = cmdId;
  }
  async execute(): Promise<void> {
    const doc = await workspace.openTextDocument({
      language: kQuartoLanguageId,
      content: this.scaffold(),
    });
    await window.showTextDocument(doc, undefined, false);
    await commands.executeCommand("cursorMove", { to: "viewPortBottom" });
  }
  protected abstract scaffold(): string;
}

class NewDocumentCommand extends NewFileCommand {
  constructor(cmdId: string) {
    super(cmdId);
  }
  protected scaffold(): string {
    return kUntitledHtml;
  }
}

class NewPresentationCommand extends NewFileCommand {
  constructor(cmdId: string) {
    super(cmdId);
  }
  protected scaffold(): string {
    return `---
title: "Untitled"
format: revealjs
---

`;
  }
}

const kUntitledHtml = `---
title: "Untitled"
format: html
---

`;
