const {PureComponent} = require('react');

export function wrap(HelloComponent) {
    return class Hello extends PureComponent {
        render() {
            return <HelloComponent/>;
        }
    }
};

