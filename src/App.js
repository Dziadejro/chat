import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyClkKTQAc7w1MoEiGMAHawqxEVTOJlxhPE",
  authDomain: "chat-95f26.firebaseapp.com",
  projectId: "chat-95f26",
  storageBucket: "chat-95f26.appspot.com",
  messagingSenderId: "1043634093771",
  appId: "1:1043634093771:web:16a2d620348f15372b254e",
  measurementId: "G-6LC4JTE5LG"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat Zaliczenie</h1>
        <Wyloguj />
      </header>
      <section>
        {user ? <Chat /> : <Zaloguj />}
      </section>
    </div>
  );
}

function Zaloguj() {

  const zalogujZGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button className="sign-in" onClick={zalogujZGoogle}>Zaloguj się z Google</button>
  );
};

function Wyloguj() {

  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Wyloguj</button>
  );
};

function Chat() {

  const scroll = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);
  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();
    const { uid } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    });
    setFormValue('');
    scroll.current.scrollIntoView({ behavior: 'smooth' });
  }


  return (
  <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={scroll}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit" disabled={!formValue}>Wyślij</button>
    </form>
  </>)
};

function ChatMessage(props) {

  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
