class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }
    setAttribute(name, value) {
        this.root.setAttribute(name, value);
    }
    
    appendChild(vChild) {
        vChild.mountTo(this.root);
    }

    mountTo(parent) {
        parent.appendChild(this.root);
    }
}

class TextWrapper {
    constructor(context) {
        this.root = document.createTextNode(context)
    }
    mountTo(parent) {
        parent.appendChild(this.root);
    }
}


export class Component {

    constructor(){
        this.child = [];
    }

    appendChild(vChild) {
        this.child.push(vChild)
    }

    setAttribute(name,value){
        this[name] = value;
    }
    mountTo(parent){
        let vdom  = this.render();
        vdom.mountTo(parent);
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
                if(typeof child === "object" && child instanceof Array){
                    insertChildren(child);
                }else{
                    if(!(child instanceof Component) && !(child instanceof ElementWrapper) && !(child instanceof TextWrapper)){
                        child = String(child);
                    }
                    if(typeof child === "string"){
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
        vdom.mountTo(element);
    }
}