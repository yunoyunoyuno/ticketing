import {useState} from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const signin =  () => {
    
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const {doRequest,errors} = useRequest({url : '/api/v0.0.1/users/signin',
        method : 'post',
        body: {email,password},
        onSuccess: () => Router.push('/')});

    const onSubmit = async(e) => {
        e.preventDefault()
        await doRequest();
    }

    return(
        <form onSubmit = {onSubmit}>
            <h1>Sign In</h1>
            <div className = "form-group">
                <label>Email Address</label>
                <input value = {email} className = "form-control" 
                    onChange = {e => setEmail(e.target.value)} />
            </div>
            <div className = "form-group">
                <label>Password</label>
                <input type = "password" className = "form-control" 
                    value = {password} onChange = {e => setPassword(e.target.value)} />
            </div>
            {errors}
            <button className = "btn btn-primary"> Sign In</button>
        </form>
    )
}

export default signin