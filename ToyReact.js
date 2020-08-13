const childrenSymbol = Symbol("children");
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
        this.type = type;
        this.props = Object.create(null);
        this[childrenSymbol] = [];
        this.children = [];
    }
    setAttribute(name, value) {
        this.props[name] = value;
    }

    get vdom() {
        return this;
    }

    appendChild(vChild) {

        this[childrenSymbol].push(vChild);
        this.children.push(vChild.vdom);
    }

    mountTo(range) {
        this.range = range;
        let placeholder = document.createComment("placeholder");
        let tempRange = document.createRange();
        tempRange.setStart(this.range.endContainer,this.range.endOffset);
        tempRange.setEnd(this.range.endContainer,this.range.endOffset);
        tempRange.insertNode(placeholder);
        range.deleteContents();
        let element = document.createElement(this.type);
        // console.log(this.props);
        for (let name in this.props) {
            if (name.match(/^on([\s\S]+)$/)) {
                element.addEventListener(RegExp.$1.toLowerCase(), this.props[name]);
            }
            if (name === 'className') {
                name = 'class';
                element.setAttribute(name, this.props['className'])
            } else {
                element.setAttribute(name, this.props[name])
            }
        }
        for (let child of this.children) {
            let range = document.createRange();
            if (element.children.length) {
                range.setStartAfter(element.lastChild);
                range.setEndAfter(element.lastChild);
            } else {
                range.setStart(element, 0);
                range.setEnd(element, 0);
            }
            child.mountTo(range);
        }
        range.insertNode(element);
    }
}

class TextWrapper {
    constructor(context) {
        this.root = document.createTextNode(context)
        this.type = '#text';
        this.children = '';
        this.props = Object.create(null);
    }
    mountTo(range) {
        this.range = range;
        range.deleteContents();
        range.insertNode(this.root);
    }
    get vdom() {
        return this;
    }
}


export class Component {

    constructor() {
        this.child = [];
        this.props = Object.create(null);
        this.state = {};
    }

    get type() {
        return this.constructor.name;
    }

    get children() {
      return this.children.map(child => child.vdom)
    }

    get vdom() {
        return this.render().vdom;
    }
    appendChild(vChild) {
        this.children.push(vChild)
    }

    addEvent(even, func) {
        this.root.addEventListener(even, func);
    }

    setAttribute(name, value) {
        this.props[name] = value;
        this[name] = value;
    }

    setState(state) {

        const merge = (oldState, newState) => {
            for (let i in newState) {
                if (typeof newState[i] === 'object' && newState[i] !== null) {
                    if (typeof oldState[i] !== 'object') {
                        if (newState[i] instanceof Array) {
                            oldState[i] = [];
                        } else {
                            oldState[i] = {};
                        }
                    }
                    merge(oldState[i], newState[i]);
                } else {
                    oldState[i] = newState[i];
                }
            }
        }
        if (state && !this.state) {
            this.state = {};
        }
        merge(this.state, state);
        this.update();
    }

    mountTo(range) {
        this.range = range;
        this.update();
    }

    update() {
        let vdom = this.vdom;
        if (this.oldVdom) {
            let isSameNode = (node1, node2) => {
                if (node1.type !== node2.type) {
                    return false;
                }
                for (let name in node1.props) {
                    if (typeof node1.props[name] === 'object') {
                        if (node1.props[name].toString() !== node2.props[name].toString()) {
                            return false;
                        }
                    /*} else if (typeof node1.props[name] === 'function') {
                        if (JSON.stringify(node1.props[name].toString()) !== JSON.stringify(node2.props[name].toString())) {
                            return false;
                        }*/
                    } else if (node1.props[name] !== node2.props[name]) {
                        return false;
                    }
                }
                if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
                    return false;
                }
                return true;
            }
            let isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) {
                    return false;
                }
                if (node1.children.length !== node2.children.length) {
                    return false;
                }

                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i])) {
                        return false;
                    }
                }
                return true;
            }

            let replace = (newTree, oldTree) => {
                if (isSameTree(newTree, oldTree)) {
                    return;
                }
                if (!isSameNode(newTree, oldTree)) {
                    newTree.mountTo(oldTree.range);
                } else {
                    for (let i = 0; i < newTree.children.length; i++) {
                        replace(newTree.children[i], oldTree.children[i]);
                    }
                }
            }
            replace(vdom, this.oldVdom);
        } else {
            vdom.mountTo(this.range);
        }
        this.oldVdom = vdom;
    }
}

export const ToyReact = {
    createElement(type, attrbutes, ...children) {
        let element;
        if (typeof type === "string") {
            element = new ElementWrapper(type);
        } else {
            element = new type;
        }
        for (let name in attrbutes) {
            element.setAttribute(name, attrbutes[name]);
        }

        const insertChildren = (children) => {
            for (let child of children) {
                if (typeof child === "object" && child instanceof Array) {
                    insertChildren(child);
                } else {
                    if (child === null || child === void 0) {
                        child = "";
                    }
                    if (!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)) {
                        child = String(child);
                    }
                    if (typeof child === "string") {
                        child = new TextWrapper(child)
                    }
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children);

        return element;
    },
    render(vdom, element) {
        let range = document.createRange();
        if (element.children.length) {
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild);
        } else {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        }
        vdom.mountTo(range);
    }
}