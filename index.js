const express = require("express")
const solc = require("solc")
const cors = require("cors");
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/compile', (req, res) => {
    const solCode = req.body.solCode;

    // Compile the Solidity code
    const { bytecode, abi, errors , contract , outputData } = compileSolidityCode(solCode);

    if (errors) {
        res.status(400).json({ errors });
    } else {
        res.json({ bytecode, abi , contract , outputData });
    }
});

function compileSolidityCode(solCode) {
    // Define the Solidity source code
    const input = {
        language: 'Solidity',
        sources: {
            'contract.sol': {
                content: solCode,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    // Compile the Solidity code
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    const outputData = JSON.stringify(output,null,2)

    // Check for compilation errors
    if (output.errors) {
        const errors = output.errors.map(error => error.formattedMessage);
        return { errors };
    }

    // Extract and return the compiled contract bytecode and ABI
    const contractName = Object.keys(output.contracts['contract.sol'])[0];
    const bytecode = output.contracts['contract.sol'][contractName].evm.bytecode.object;
    const abi = output.contracts['contract.sol'][contractName].abi;
    const contract = output.contracts['contract.sol'][contractName];

    return { bytecode, abi ,contract,outputData};
}

app.listen(port, () => {
    console.log("listening on port 8080");
})



