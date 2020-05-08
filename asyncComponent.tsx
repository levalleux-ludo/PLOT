import React, {Component, ReactNode} from 'react';

const asyncComponent = (importComponent: (props: any) => Promise<ReactNode>) => {
    return class extends Component {
        state = {
            component: null
        }

        componentDidMount() {
            importComponent(this.props)
                .then(cmp => {
                    this.setState({component: cmp});
                });
        }

        render() {
            const C = typeof this.state.component;
            return C ? C : null;
        }
    }
};

export default asyncComponent;