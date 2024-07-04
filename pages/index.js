import Head from "next/head";
import Image from "next/image";
import Link from 'next/link'
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [forms, setForms] = useState([])

  useEffect(()=>{
    if(session){
      getForms();
    }
  },[session])

  const getForms = async () => {
    const forms = await fetch('/api/typeform/getforms').then((resp) => resp.json())
    console.log(forms)
    if(forms){
      console.log('setforms', forms.items)
      setForms(forms.items)
    }
  }

  const printForm = async (formId) => {
    console.log("formId", formId)
    const pdf = await fetch(`/api/typeform/printform?form_id=${formId}`).then((resp)=>resp.json())
    console.log('pdf', pdf)
  }

  return (
    <>
      {session && (
        <>
          <h1>Hey {session.user.email}</h1>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
      <ul>
        {forms && forms.length>0 && forms.map((f)=>{
          return <li key={f.id}><Link href={`/api/typeform/printform?form_id=${f.id}`}>{f.title}</Link></li>
        })}
      </ul>
      {!session && (
        <div className={styles.container}>
          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
    </>
  );
}
