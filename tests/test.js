const axios = require('axios')
const { testCases } = require('./data/testJson')
const { describe, expect, it } = require('@jest/globals')

const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3000/api/execute/'
const { compileAndRun } = require('../services/compile.service');

describe('Go Tests', function() {
  it('should compile and run Go code', async function() {
    const result = await compileAndRun('go', 'package main\nimport "fmt"\nfunc main() {\n fmt.Println("Hello, Go!")\n}');
    assert.strictEqual(result, 'Hello, Go!\n');
  });

  it('should handle compilation errors in Go code', async function() {
    try {
      await compileAndRun('go', 'package main\nimport "fmt"\nfunc main() {\n fmt.Println("Hello, Go!")\n');
      assert.fail('Compilation should have failed');
    } catch (error) {
      assert.strictEqual(error.code, 1); // Example: Check error code or message
    }
  });
});

describe('Rust Tests', function() {
  it('should compile and run Rust code', async function() {
    const result = await compileAndRun('rust', 'fn main() {\n println!("Hello, Rust!");\n}');
    assert.strictEqual(result, 'Hello, Rust!\n');
  });

  it('should handle runtime errors in Rust code', async function() {
    try {
      await compileAndRun('rust', 'fn main() {\n panic!("Error!");\n}');
      assert.fail('Execution should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.stderr, 'Error!\n'); // Example: Check error message
    }
  });
});


describe('Tests', () => {
    for (const testCase of testCases) {
        it(testCase.name, async () => {
            const response = await axios.post(ENDPOINT, testCase.reqObject)
            if (typeof response.data.output === 'object') {
                expect(response.data.output.score).toBeDefined()
                expect(response.data.output.rationale.positives).toBeDefined()
                expect(response.data.output.rationale.negatives).toBeDefined()
                expect(response.data.output.points).toBeDefined()
            } else {
                expect(response).toHaveProperty('data.output', testCase.expectedResponse.val)
            }
            expect(response).toHaveProperty('status', testCase.expectedResponse.status)
            expect(response).toHaveProperty('data.error', testCase.expectedResponse.error)
        }, 15000)
    }
})
