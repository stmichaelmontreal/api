function getImage(content) {
    const regExt = /^(data:image\/)(?<ext>[a-z]{3})(;base64)/;
    const ext = content.match(regExt).groups.ext;
    return {ext: ext, content: content.replace(regExt, '')};
}

module.exports.getImage = getImage;
