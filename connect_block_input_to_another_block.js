Blockly.Blocks['custom_logic_compare'] = {
      init: function () {
        this.appendValueInput('A').setCheck(null);
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown([
            ['==', 'EQ'],
            ['!=', 'NEQ'],
            ['is', 'IS'],
            ['is not', 'IS_NOT'],
            ['<', 'LT'],
            ['<=', 'LTE'],
            ['>', 'GT'],
            ['>=', 'GTE'],
          ]),
          'OPERATOR',
        );
        this.appendValueInput('B').setCheck(null);
        this.setOutput(true, 'Boolean');
        this.setColour('rgb(76, 151, 255)');
        this.setTooltip('Compares two values based on selected operator.');

        this.setOnChange(function (event) {
          if (
            event.type === Blockly.Events.CREATE ||
            event.type === Blockly.Events.BLOCK_CHANGE
          ) {
            const conditionBlockA = this.getInputTargetBlock('A');
            const conditionBlockB = this.getInputTargetBlock('B');
            if (!conditionBlockA) {
              const defaultBlock = this.workspace.newBlock('circular_input');
              defaultBlock.setFieldValue('0', 'EXPRESSION');
              defaultBlock.setShadow(true);
              if (typeof defaultBlock?.initSvg === 'function') {
                defaultBlock.initSvg();
              }
              if (typeof defaultBlock?.render === 'function') {
                defaultBlock.render();
              }
              this.getInput('A').connection.connect(
                defaultBlock.outputConnection,
              );
            }
            if (!conditionBlockB) {
              const defaultBlock = this.workspace.newBlock('circular_input');
              defaultBlock.setFieldValue('0', 'EXPRESSION');
              defaultBlock.setShadow(true);
              if (typeof defaultBlock?.initSvg === 'function') {
                defaultBlock.initSvg();
              }
              if (typeof defaultBlock?.render === 'function') {
                defaultBlock.render();
              }
              this.getInput('B').connection.connect(
                defaultBlock.outputConnection,
              );
            }
          }
        });
      },
    };

    pythonGenerator['custom_logic_compare'] = function (block) {
      const a =
        pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ATOMIC) ||
        'None';
      const b =
        pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ATOMIC) ||
        'None';

      const operator = block.getFieldValue('OPERATOR');

      let code;
      switch (operator) {
        case 'EQ':
          code = `${a} == ${b}`;
          break;
        case 'NEQ':
          code = `${a} != ${b}`;
          break;
        case 'IS':
          code = `${a} is ${b}`;
          break;
        case 'IS_NOT':
          code = `${a} is not ${b}`;
          break;
        case 'LT':
          code = `${a} < ${b}`;
          break;
        case 'LTE':
          code = `${a} <= ${b}`;
          break;
        case 'GT':
          code = `${a} > ${b}`;
          break;
        case 'GTE':
          code = `${a} >= ${b}`;
          break;
        default:
          code = `${a} == ${b}`;
      }

      return [code, pythonGenerator.ORDER_RELATIONAL];
    };
