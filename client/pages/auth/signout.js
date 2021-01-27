import {useEffect} from 'react';
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const SignOut = () => {
    const {doRequest} = useRequest({
        url : '/api/v0.0.1/users/signout',
        method: 'post',
        body : {},
        onSuccess : () => Router.push('/')
    })

    useEffect(() => {
        doRequest()
    })

    return <div>Signing you out ...</div>
}

export default SignOut;