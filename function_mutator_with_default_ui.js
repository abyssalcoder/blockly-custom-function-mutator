export const functionMutatorBuilder = (function () {
  let Blockly = null;
  let pythonGenerator = null;
  let blocklyWorkspace = {
    current: null,
  };
  let isRegistered = false;

  return {
    configureBlockly: function (BlocklyInstance) {
      Blockly = BlocklyInstance;
      return this;
    },

    configureGenerator: function (generatorInstance) {
      pythonGenerator = generatorInstance;
      return this;
    },

    configureWorkspace: function (workspaceInstance) {
      blocklyWorkspace.current = workspaceInstance;
      return this;
    },

    registerMutators: function () {
      if (!Blockly) {
        throw new Error(
          "functionMutatorsBuilder instance must be configured before registering blocks."
        );
      }

      Blockly.Blocks["function_definition"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("def")
            .appendField(new Blockly.FieldTextInput("function_name"), "NAME")
            .appendField("(");
          this.argCount = 1;
          this.addArgumentInput(0);
          this.appendDummyInput("CLOSE_PAREN").appendField("):");
          this.appendStatementInput("BODY").setCheck(null).appendField("");
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour("rgb(15, 189, 140)");
          this.setTooltip(
            "Function definition with dynamic arguments and body"
          );
          this.setMutator(
            new Blockly.icons.MutatorIcon(["add_argument"], this)
          );
        },

        addArgumentInput: function (i) {
          if (i === 0) {
            this.appendValueInput("ARG" + i).setCheck("String");
          } else {
            this.appendValueInput("ARG" + i)
              .setCheck("String")
              .appendField(",");
          }
        },

        decompose: function (workspace) {
          const containerBlock = workspace.newBlock("add_argument_container");
          containerBlock.initSvg();
          let connection = containerBlock.getInput("STACK").connection;
          for (let i = 0; i < this.argCount; i++) {
            const argBlock = workspace.newBlock("add_argument");
            argBlock.initSvg();
            connection.connect(argBlock.previousConnection);
            connection = argBlock.nextConnection;
          }
          return containerBlock;
        },

        saveConnections: function (containerBlock) {
          let argBlock = containerBlock.getInputTargetBlock("STACK");
          let i = 0;
          while (argBlock) {
            const input = this.getInput("ARG" + i);
            if (input && argBlock.valueConnection_) {
              argBlock.valueConnection_ = input.connection.targetConnection;
            }
            argBlock =
              argBlock.nextConnection && argBlock.nextConnection.targetBlock();
            i++;
          }
          const bodyInput = this.getInput("BODY");
          containerBlock.bodyConnection_ =
            bodyInput && bodyInput.connection.targetConnection;
        },

        compose: function (containerBlock) {
          let argBlock = containerBlock.getInputTargetBlock("STACK");
          const connections = [];
          for (let i = 0; argBlock; i++) {
            connections.push(argBlock.valueConnection_);
            argBlock =
              argBlock.nextConnection && argBlock.nextConnection.targetBlock();
          }
          for (let i = this.argCount - 1; i >= 0; i--) {
            this.removeInput("ARG" + i);
          }
          this.argCount = connections.length;
          for (let i = 0; i < this.argCount; i++) {
            this.addArgumentInput(i);
          }
          for (let i = 0; i < this.argCount; i++) {
            if (connections[i]) {
              this.getInput("ARG" + i).connection.connect(connections[i]);
            }
          }
          this.moveInputBefore("CLOSE_PAREN", null);
          this.moveInputBefore("BODY", null);
          if (containerBlock.bodyConnection_) {
            this.getInput("BODY").connection.connect(
              containerBlock.bodyConnection_
            );
          }
        },
      };

      Blockly.Blocks["add_argument_container"] = {
        init: function () {
          this.appendDummyInput().appendField("Arguments");
          this.appendStatementInput("STACK");
          this.setColour(290);
          this.setTooltip("Add or remove arguments");
          this.contextMenu = false;
        },
      };

      Blockly.Blocks["add_argument"] = {
        init: function () {
          this.appendDummyInput().appendField("Argument");
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour(290);
          this.setTooltip("Add an argument");
          this.contextMenu = false;
        },
      };

      if (!Blockly.Extensions.isRegistered("function_definition")) {
        Blockly.Extensions.registerMutator(
          "function_definition",
          {
            mutationToDom: function () {
              const container = document.createElement("mutation");
              container.setAttribute("argCount", this.argCount);
              return container;
            },

            domToMutation: function (xmlElement) {
              this.argCount =
                parseInt(xmlElement.getAttribute("argCount"), 10) || 1;
              for (let i = 0; i < this.argCount; i++) {
                this.addArgumentInput(i);
              }
              this.moveInputBefore("CLOSE_PAREN", null);
              this.moveInputBefore("BODY", null);
            },
          },
          undefined,
          ["add_argument", "add_argument_container"]
        );
      }

      pythonGenerator["function_definition"] = function (block) {
        const functionName = block.getFieldValue("NAME");
        let args = [];
        for (let i = 0; i < block.argCount; i++) {
          const arg = pythonGenerator.valueToCode(
            block,
            "ARG" + i,
            pythonGenerator.ORDER_NONE
          );
          if (arg) {
            args.push(arg);
          }
        }
        const argsString = args.join(", ");
        const functionBody =
          pythonGenerator.statementToCode(block, "BODY") ||
          pythonGenerator.PASS;
        return `def ${functionName}(${argsString}):\n${functionBody}`;
      };

      Blockly.Blocks["function_call"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("function_name"), "NAME")
            .appendField("(");
          this.argCount = 1;
          this.addArgumentInput(0);
          this.appendDummyInput("CLOSE_PAREN").appendField(")");
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour("rgb(15, 189, 140)");
          this.setTooltip("Function call with dynamic arguments");
          this.setMutator(
            new Blockly.icons.MutatorIcon(["add_argument"], this)
          );
        },

        addArgumentInput: function (i) {
          if (i === 0) {
            this.appendValueInput("ARG" + i).setCheck("String");
          } else {
            this.appendValueInput("ARG" + i)
              .setCheck("String")
              .appendField(",");
          }
        },

        decompose: function (workspace) {
          const containerBlock = workspace.newBlock("add_argument_container");
          containerBlock.initSvg();
          let connection = containerBlock.getInput("STACK").connection;
          for (let i = 0; i < this.argCount; i++) {
            const argBlock = workspace.newBlock("add_argument");
            argBlock.initSvg();
            connection.connect(argBlock.previousConnection);
            connection = argBlock.nextConnection;
          }
          return containerBlock;
        },

        compose: function (containerBlock) {
          let argBlock = containerBlock.getInputTargetBlock("STACK");
          const connections = [];
          for (let i = 0; argBlock; i++) {
            connections.push(argBlock.valueConnection_);
            argBlock =
              argBlock.nextConnection && argBlock.nextConnection.targetBlock();
          }
          for (let i = this.argCount - 1; i >= 0; i--) {
            this.removeInput("ARG" + i);
          }
          this.argCount = connections.length;
          for (let i = 0; i < this.argCount; i++) {
            this.addArgumentInput(i);
          }
          for (let i = 0; i < this.argCount; i++) {
            if (connections[i]) {
              this.getInput("ARG" + i).connection.connect(connections[i]);
            }
          }
          this.moveInputBefore("CLOSE_PAREN", null);
        },

        saveConnections: function (containerBlock) {
          let argBlock = containerBlock.getInputTargetBlock("STACK");
          let i = 0;
          while (argBlock) {
            const input = this.getInput("ARG" + i);
            if (input && argBlock.valueConnection_) {
              argBlock.valueConnection_ = input.connection.targetConnection;
            }
            argBlock =
              argBlock.nextConnection && argBlock.nextConnection.targetBlock();
            i++;
          }
        },
      };

      Blockly.Blocks["add_argument_container"] = {
        init: function () {
          this.appendDummyInput().appendField("Arguments");
          this.appendStatementInput("STACK");
          this.setColour(290);
          this.setTooltip("Add or remove arguments");
          this.contextMenu = false;
        },
      };

      Blockly.Blocks["add_argument"] = {
        init: function () {
          this.appendDummyInput().appendField("Argument");
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour(290);
          this.setTooltip("Add an argument");
          this.contextMenu = false;
        },
      };

      if (!Blockly.Extensions.isRegistered("function_call")) {
        Blockly.Extensions.registerMutator(
          "function_call",
          {
            mutationToDom: function () {
              const container = document.createElement("mutation");
              container.setAttribute("argCount", this.argCount);
              return container;
            },

            domToMutation: function (xmlElement) {
              this.argCount =
                parseInt(xmlElement.getAttribute("argCount"), 10) || 1;
              for (let i = 0; i < this.argCount; i++) {
                this.addArgumentInput(i);
              }
              this.moveInputBefore("CLOSE_PAREN", null);
            },
          },
          undefined,
          ["add_argument", "add_argument_container"]
        );
      }

      pythonGenerator["function_call"] = function (block) {
        const functionName = block.getFieldValue("NAME");
        let args = [];
        for (let i = 0; i < block.argCount; i++) {
          const arg = pythonGenerator.valueToCode(
            block,
            "ARG" + i,
            pythonGenerator.ORDER_NONE
          );
          if (arg) {
            args.push(arg);
          }
        }
        const argsString = args.join(", ");
        return `${functionName}(${argsString})`;
      };

      isRegistered = true;
    },

    isRegistered: function () {
      return isRegistered;
    },
  };
})();
