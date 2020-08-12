class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }
    setAttribute(name, value) {
        if (name !== 'className') {
            if (name.match(/^on([\s\S]+)$/)) {
                this.root.addEventListener(RegExp.$1.toLowerCase(), value);
            }
        } else {
            name = 'class';
        }
        this.root.setAttribute(name, value);
    }

    addEvent(even, func) {
        even.match(/^on([\s\S]+)$/);
        this.root.addEventListener(RegExp.$1.toLowerCase(), func);
    }

    appendChild(vChild) {
        let range = document.createRange();
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild);
            // range.setStart(this.root,this.root.children.length-1);
            // range.setEnd(this.root,this.root.children.length-1);
        } else {
            range.setStart(this.root,0);
            range.setEnd(this.root,0);
        }
        vChild.mountTo(range);
    }

    mountTo(range) {

        range.deleteContents();
        range.insertNode(this.root);
    }
}

class TextWrapper {
    constructor(context) {
        this.root = document.createTextNode(context)
    }
    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
}


export class Component {

    constructor() {
        this.child = [];
        this.props = Object.create(null);
        this.state = {};
    }

    appendChild(vChild) {
        this.child.push(vChild)
    }

    addEvent(even, func) {
        this.root.addEventListener(even, func);
    }

    setAttribute(name, value) {
        if (name.match(/^on[\s\S]+/)) {
            // let vdom  = this.render();
            // vdom.setAttribute(name,value);
        }
        this.props[name] = value;
        this[name] = value;
    }

    setState(state) {

        const merge = (oldState, newState) => {
            for (let i in newState) {
                if (typeof newState[i] === 'object' && newState[i] !== null) {
                    if (typeof oldState[i] !== 'object') {
                        newState[i] = {};
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
        // this.startOffset = range.startOffset;
        this.update();
    }

    update (){
        let placeholder = document.createComment("placeholder");
        let range = document.createRange();
        range.setStart(this.range.endContainer,this.range.endOffset);
        range.setEnd(this.range.endContainer,this.range.endOffset);
        range.insertNode(placeholder);
        this.range.deleteContents();
        let vdom = this.render();
        vdom.mountTo(this.range);
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
            // if(typeof attrbutes[name] === "function"){
            //     element.addEvent(name,attrbutes[name]);
            // }else{
            //     element.setAttribute(name, attrbutes[name]);
            // }
            element.setAttribute(name, attrbutes[name]);
        }

        const insertChildren = (children) => {
            for (let child of children) {
                if (typeof child === "object" && child instanceof Array) {
                    insertChildren(child);
                } else {
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
            // range.setStart(element,element.children.length-1);
            // range.setEnd(element,element.children.length-1);
        } else {
            range.setStart(element,0);
            range.setEnd(element,0);
        }
        vdom.mountTo(range);
    }
}