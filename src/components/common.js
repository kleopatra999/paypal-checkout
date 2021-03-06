/* @flow */

import { config } from '../config';

export function validateProps(props : Object, required : boolean = true) {

    if (!required) {
        return;
    }

    if (props.env && !config.paypalUrls[props.env]) {
        throw new Error(`Invalid env: ${props.env}`);
    }

    if (!props.payment) {
        throw new Error(`Must specify payment method`);
    }

    if (!props.onAuthorize) {
        throw new Error(`Must specify onAuthorize callback`);
    }
    
    if (props.style && props.style.size) {
        if (config.buttonSizes.indexOf(props.style.size) === -1) {
            throw new Error(`Invalid button size: ${props.style.size}`);
        }
    }

    let env = props.env || config.env;

    if (props.client) {
        let clientID = props.client[env];

        if (!clientID) {
            throw new Error(`Client ID not found for env: ${env}`);
        }

        if (clientID.match(/^(.)\1+$/)) {
            throw new Error(`Invalid client ID: ${clientID}`);
        }
    }
}
