import { ToyReact, Component } from './ToyReact';

class MyComponent extends Component {
    render() {
        return <div>Cool
            <span id="ss"> sss </span>
            <span> sfdsaf </span>
            <div>
                {true}
                {this.child}
            </div>
        </div>
    }
}
let a = <MyComponent name="a" id="ids">
    <div>some</div>
</MyComponent>
ToyReact.render(a, document.body);