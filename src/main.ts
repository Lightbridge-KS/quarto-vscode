/*---------------------------------------------------------------------------------------------
 *  Copyright (c) RStudio, PBC. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { MarkdownEngine } from "./markdown/engine";
import { kQuartoDocSelector } from "./core/doc";
import { activateLsp } from "./lsp/client";
import { cellCommands } from "./providers/cell/commands";
import { quartoCellExecuteCodeLensProvider } from "./providers/cell/codelens";
import { activateQuartoLensPanel } from "./providers/lens/panel";
import { lensCommands } from "./providers/lens/commands";
import { activateCommon } from "./extension";

export function activate(context: vscode.ExtensionContext) {
  // create markdown engine
  const engine = new MarkdownEngine();

  // activate providers common to browser/node
  const commands = [...cellCommands(engine), ...lensCommands(engine)];
  activateCommon(context, engine, commands);

  // activate lsp for node
  activateLsp(context, engine);

  // activate lens panel for node
  activateQuartoLensPanel(context, engine);

  // provide code lens for node
  vscode.languages.registerCodeLensProvider(
    kQuartoDocSelector,
    quartoCellExecuteCodeLensProvider(engine)
  );
}