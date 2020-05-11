import React, {Component, ReactNode} from 'react';
import { Spinner } from 'native-base';

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
            const C = this.state.component;
            return C ? C : <Spinner />;
        }
    }
};

export default asyncComponent;