function formatErrors(errors) {
    return errors
        .map((e, i) => `${i + 1}. ${e.message || e}`)
        .join('\n');
}

module.exports = { formatErrors };
