import { ToyReact, Component } from './ToyReact';
window.SquareData = {}
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

class Square extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
        }
    }
    render() {
        window.SquareData[this.props.value] = this;
        return (
            <button className="square" onClick={() => { this.setState({ value: 'X' }) }}>
                {this.state.value?this.state.value:""}
            </button>
        );
    }
}
class Board extends Component {
    renderSquare(i) {
        return <Square value={i} />;
    }

    render() {
        //   const status = 'Next player: X';

        return (
            <div>
                {/* <div className="status">{status}</div> */}
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

let a = <Board onClick={function () { alert('hahaha') }} />
ToyReact.render(a, document.body);