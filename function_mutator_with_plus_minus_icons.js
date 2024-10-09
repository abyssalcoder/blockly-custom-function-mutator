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

      Blockly.Blocks["custom_function"] = {
        init: function () {
          this.argumentCount_ = 0;
          this.appendDummyInput("TITLE")
            .appendField("def")
            .appendField(new Blockly.FieldTextInput("function_name"), "NAME")
            .appendField("(")
            .appendField(createPlusField(), "PLUS");

          this.addArgument();

          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour("rgb(15, 189, 140)");
          this.setOutput(true, null);

          this.updateMinus_();
        },

        updateShape_: function (count = this.argumentCount_) {
          for (let i = 0; i < this.argumentCount_; i++) {
            this.removeInput("ARG" + i);
          }

          for (let i = 0; i < count; i++) {
            if (i === 0) {
              this.appendValueInput("ARG" + i).setCheck("String");
            } else {
              this.appendValueInput("ARG" + i)
                .setCheck("String")
                .appendField(",");
            }
          }

          this.argumentCount_ = count;

          if (this.getInput("CLOSE_STATEMENT")) {
            this.removeInput("CLOSE_STATEMENT");
          }
          if (this.getInput("BODY")) {
            this.removeInput("BODY");
          }
          this.appendDummyInput("CLOSE_STATEMENT").appendField("):");
          this.appendStatementInput("BODY").setCheck(null);

          this.updateMinus_();
        },

        addArgument: function () {
          this.updateShape_(this.argumentCount_ + 1);
        },

        removeArgument: function () {
          if (this.argumentCount_ >= 1) {
            this.updateShape_(this.argumentCount_ - 1);
          }
        },

        updateMinus_: function () {
          const minusField = this.getField("MINUS");
          if (!minusField && this.argumentCount_ >= 1) {
            this.getInput("TITLE").insertFieldAt(
              3,
              createMinusField(),
              "MINUS"
            );
          } else if (minusField && this.argumentCount_ <= 1) {
            this.getInput("TITLE").removeField("MINUS");
          }
        },
      };

      Blockly.Blocks["function_call"] = {
        init: function () {
          this.argumentCount_ = 0;

          this.appendDummyInput("TITLE")
            .appendField(new Blockly.FieldTextInput("function_name"), "NAME")
            .appendField("(")
            .appendField(createPlusField(), "PLUS");

          this.addArgument();

          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour("rgb(15, 189, 140)");
          this.setOutput(true, null);

          this.updateMinus_();
        },

        updateShape_: function (count = this.argumentCount_) {
          for (let i = 0; i < this.argumentCount_; i++) {
            this.removeInput("ARG" + i);
          }

          for (let i = 0; i < count; i++) {
            if (i === 0) {
              this.appendValueInput("ARG" + i).setCheck("String");
            } else {
              this.appendValueInput("ARG" + i)
                .setCheck("String")
                .appendField(",");
            }
          }

          this.argumentCount_ = count;

          if (this.getInput("CLOSE_STATEMENT")) {
            this.removeInput("CLOSE_STATEMENT");
          }
          this.appendDummyInput("CLOSE_STATEMENT").appendField(")");

          this.updateMinus_();
        },

        addArgument: function () {
          this.updateShape_(this.argumentCount_ + 1);
        },

        removeArgument: function () {
          if (this.argumentCount_ >= 1) {
            this.updateShape_(this.argumentCount_ - 1);
          }
        },

        updateMinus_: function () {
          const minusField = this.getField("MINUS");
          if (!minusField && this.argumentCount_ >= 1) {
            this.getInput("TITLE").insertFieldAt(
              2,
              createMinusField(),
              "MINUS"
            );
          } else if (minusField && this.argumentCount_ <= 1) {
            this.getInput("TITLE").removeField("MINUS");
          }
        },
      };

      function createPlusField() {
        return new Blockly.FieldImage(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMiAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuNDM3NSA4LjU2MjVWNy4wNjI1SDMuOTM3NUMzLjYwOTM4IDcuMDYyNSAzLjM3NSA2LjgyODEyIDMuMzc1IDYuNUMzLjM3NSA2LjE5NTMxIDMuNjA5MzggNS45Mzc1IDMuOTM3NSA1LjkzNzVINS40Mzc1VjQuNDM3NUM1LjQzNzUgNC4xMzI4MSA1LjY3MTg4IDMuODc1IDYgMy44NzVDNi4zMDQ2OSAzLjg3NSA2LjU2MjUgNC4xMzI4MSA2LjU2MjUgNC40Mzc1VjUuOTM3NUg4LjA2MjVDOC4zNjcxOSA1LjkzNzUgOC42MjUgNi4xOTUzMSA4LjYyNSA2LjVDOC42MjUgNi44MjgxMiA4LjM2NzE5IDcuMDYyNSA4LjA2MjUgNy4wNjI1SDYuNTYyNVY4LjU2MjVDNi41NjI1IDguODkwNjIgNi4zMDQ2OSA5LjEyNSA2IDkuMTI1QzUuNjcxODggOS4xMjUgNS40Mzc1IDguODkwNjIgNS40Mzc1IDguNTYyNVpNMTIgNi41QzEyIDkuODI4MTIgOS4zMDQ2OSAxMi41IDYgMTIuNUMyLjY3MTg4IDEyLjUgMCA5LjgyODEyIDAgNi41QzAgMy4xOTUzMSAyLjY3MTg4IDAuNSA2IDAuNUM5LjMwNDY5IDAuNSAxMiAzLjE5NTMxIDEyIDYuNVpNNiAxLjYyNUMzLjMwNDY5IDEuNjI1IDEuMTI1IDMuODI4MTIgMS4xMjUgNi41QzEuMTI1IDkuMTk1MzEgMy4zMDQ2OSAxMS4zNzUgNiAxMS4zNzVDOC42NzE4OCAxMS4zNzUgMTAuODc1IDkuMTk1MzEgMTAuODc1IDYuNUMxMC44NzUgMy44MjgxMiA4LjY3MTg4IDEuNjI1IDYgMS42MjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
          22,
          22,
          "+",
          function () {
            this.getSourceBlock().addArgument();
          }
        );
      }

      function createMinusField() {
        return new Blockly.FieldImage(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMiAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguMDYyNSA1LjkzNzVDOC4zNjcxOSA1LjkzNzUgOC42MjUgNi4xOTUzMSA4LjYyNSA2LjVDOC42MjUgNi44MjgxMiA4LjM2NzE5IDcuMDYyNSA4LjA2MjUgNy4wNjI1SDMuOTM3NUMzLjYwOTM4IDcuMDYyNSAzLjM3NSA2LjgyODEyIDMuMzc1IDYuNUMzLjM3NSA2LjE5NTMxIDMuNjA5MzggNS45Mzc1IDMuOTM3NSA1LjkzNzVIOC4wNjI1Wk0xMiA2LjVDMTIgOS44MjgxMiA5LjMwNDY5IDEyLjUgNiAxMi41QzIuNjcxODggMTIuNSAwIDkuODI4MTIgMCA2LjVDMCAzLjE5NTMxIDIuNjcxODggMC41IDYgMC41QzkuMzA0NjkgMC41IDEyIDMuMTk1MzEgMTIgNi41Wk02IDEuNjI1QzMuMzA0NjkgMS42MjUgMS4xMjUgMy44MjgxMiAxLjEyNSA2LjVDMS4xMjUgOS4xOTUzMSAzLjMwNDY5IDExLjM3NSA2IDExLjM3NUM4LjY3MTg4IDExLjM3NSAxMC44NzUgOS4xOTUzMSAxMC44NzUgNi41QzEwLjg3NSAzLjgyODEyIDguNjcxODggMS42MjUgNiAxLjYyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
          22,
          22,
          "-",
          function () {
            this.getSourceBlock().removeArgument();
          }
        );
      }

      if (!Blockly.Extensions.isRegistered("custom_function")) {
        Blockly.Extensions.registerMutator(
          "custom_function",
          {
            mutationToDom: function () {
              const container = Blockly.utils.xml.createElement("mutation");
              container.setAttribute("arguments", this.argumentCount_);
              return container;
            },

            domToMutation: function (xmlElement) {
              const argumentCount = parseInt(
                xmlElement.getAttribute("arguments"),
                10
              );
              if (typeof argumentCount === "number") {
                this.updateShape_(argumentCount);
              }
            },
          },
          undefined,
          []
        );
      }

      if (!Blockly.Extensions.isRegistered("function_call")) {
        Blockly.Extensions.registerMutator(
          "function_call",
          {
            mutationToDom: function () {
              const container = Blockly.utils.xml.createElement("mutation");
              container.setAttribute("arguments", this.argumentCount_);
              return container;
            },

            domToMutation: function (xmlElement) {
              const argumentCount = parseInt(
                xmlElement.getAttribute("arguments"),
                10
              );
              if (typeof argumentCount === "number") {
                this.updateShape_(argumentCount);
              }
            },
          },
          undefined,
          []
        );
      }

      if (pythonGenerator) {
        pythonGenerator["custom_function"] = function (block) {
          const functionName = block.getFieldValue("NAME");
          let args = "";
          for (let i = 0; i < block.argumentCount_; i++) {
            const arg = pythonGenerator.valueToCode(
              block,
              "ARG" + i,
              pythonGenerator.ORDER_ATOMIC
            );
            args += `${arg || ""}`;
            if (arg && i !== block.argumentCount_ - 1) {
              args += ", ";
            }
          }
          let body = pythonGenerator.statementToCode(block, "BODY");
          if (!body.trim()) {
            body = "  pass\n";
          }
          return `def ${functionName}(${args}):\n${body}`;
        };

        pythonGenerator["function_call"] = function (block) {
          const functionName = block.getFieldValue("NAME");
          let args = "";
          for (let i = 0; i < block.argumentCount_; i++) {
            const arg = pythonGenerator.valueToCode(
              block,
              "ARG" + i,
              pythonGenerator.ORDER_ATOMIC
            );
            args += `${arg || ""}`;
            if (i !== block.argumentCount_ - 1) {
              args += ", ";
            }
          }
          return `${functionName}(${args})\n`;
        };
      }

      isRegistered = true;
    },

    isRegistered: function () {
      return isRegistered;
    },
  };
})();
