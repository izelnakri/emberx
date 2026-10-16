function unwrapHandle(handle) {
  if (typeof handle === 'number') {
    return handle;
  } else {
    let error = handle.errors[0];
    throw new Error(`Compile Error: ${error.problem} @ ${error.span.start}..${error.span.end}`);
  }
}
function unwrapTemplate(template) {
  if (template.result === 'error') {
    throw new Error(`Compile Error: ${template.problem} @ ${template.span.start}..${template.span.end}`);
  }
  return template;
}

export { unwrapHandle as a, unwrapTemplate as u };
