import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData)

type AuthProvider = {
    children: ReactNode;
}

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}

export function AuthProvider(props: AuthProvider) {

    const [user, setUser] = useState<User | null>(null) //se estiver logado, terá um user. se não, será nulo

    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=c1ac3504efe5a917cb8b`

    async function signIn(githubCode: string) {

        const response = await api.post<AuthResponse>('authenticate', {
            code: githubCode,
        })

        const { token, user } = response.data

        localStorage.setItem('@dowhile:token', token)

        api.defaults.headers.common.authorization = `Bearer ${token}`

        setUser(user)

    }

    function signOut() {

        setUser(null)
        localStorage.removeItem('@dowhile:token')

    }

    useEffect(() => {

        const token = localStorage.getItem('@dowhile:token')

        if(token) {

            api.defaults.headers.common.authorization = `Bearer ${token}` //axios permite que toda a requisição daqui para frente vá com o token de autenticação junto ao cabeçalho da requisição

            api.get<User>('profile').then(response => {
                setUser(response.data)
            })
        }

    }, [])

    useEffect(() => {

        const url = window.location.href
        const hasGithubCode = url.includes('?code=')

        if(hasGithubCode) {

            const [urlWithoutCode, githubCode] = url.split('?code=') //tudo quem vem antes do '?' é a url sem o código, e o que vem depois é a url com o código

            window.history.pushState({}, '', urlWithoutCode) //faz o código não aparecer na url do callback

            signIn(githubCode)

        }

    }, [])

    return (
        <AuthContext.Provider value = {{ signInUrl, user, signOut}}>
            {props.children} {/* pega todo o conteúdo do componente  */}
        </AuthContext.Provider>
    ) 

}