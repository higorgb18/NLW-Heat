import { useEffect, useState } from "react";
import io from 'socket.io-client'
import { api } from "../../services/api"

import styles from "./styles.module.scss";

import logoImg from "../../assets/logo.svg";

type Message = {

    id: string;
    text: string;
    user: {
        name: string;
        avatar_url: string;
    }

}

const messagesQueue: Message[] = []

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: Message) => {

    messagesQueue.push(newMessage);

})


export function MessageList() {

    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {

        setInterval(() => {

            if(messagesQueue.length > 0) {
                setMessages(prevState => [ //pega a informação do estado anterior   
                    messagesQueue[0], //primeira mensagem da fila
                    prevState[0], //msg que já tinha no array da posição 0
                    prevState[1] //msg que já tinha no array da posição 1
                ].filter(Boolean)) //remove o valor null caso tenha menos de 3 msgs])

                messagesQueue.shift() //remove o item mais antigo da fila
            }

        }, 3000)

    }, [])

    useEffect(() => {

        api.get<Message[]>("messages/last3").then(response => {

            setMessages(response.data)

        })

    }, [])

    return(

        <div className={styles.messageListWrapper}>

            <img src={logoImg} alt="DoWhile 2021" />

            <ul className={styles.messageList}>

                {messages.map(message => {

                    return (

                        //passando a key pro primeiro elemento html do map

                        <li key={message.id} className={styles.message}>

                            <p className={styles.messageContent}>{message.text}</p>

                            <div className={styles.messageUser}>

                                <div className={styles.userImage}>

                                    <img src={message.user.avatar_url} alt={message.user.name}/>

                                </div>

                                <span>{message.user.name}</span>

                            </div>

                        </li>

                    )

                })}

            </ul>

        </div>

    )

}