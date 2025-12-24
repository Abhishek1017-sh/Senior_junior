// Vitest/JSDOM test setup
import '@testing-library/jest-dom';
import React from 'react';

// Ensure React is available globally for tests that use JSX compiled to React.createElement
globalThis.React = React;

// Register jest-axe matcher if available (optional dev dependency)
try {
	// eslint-disable-next-line global-require
	const { toHaveNoViolations } = require('jest-axe');
	expect.extend({ toHaveNoViolations });
} catch (e) {
	// jest-axe not installed in this environment — skip matcher registration
}

// Provide lightweight mocks for browser APIs that can allocate large buffers
// during tests (e.g., FileReader). This keeps tests deterministic and avoids
// worker memory pressure caused by real implementations.
class MockFileReader {
	constructor() {
		this.onloadend = null;
		this.result = 'data:;base64,TEST';
	}
	readAsDataURL(_file) {
		if (typeof this.onloadend === 'function') {
			// call asynchronously to mimic browser behaviour
			setTimeout(() => this.onloadend({ target: this }), 0);
		}
	}
}

global.FileReader = global.FileReader || MockFileReader;
global.confirm = global.confirm || (() => true);
