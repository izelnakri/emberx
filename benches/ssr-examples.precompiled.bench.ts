// scripts/check-benchmarks.ts bundles this file with every template compiled at build time.
import benchExamples from './ssr-examples.ts';

await benchExamples('precompiled');
