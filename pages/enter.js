import { auth, googleAuthProvider } from '../lib/Firebaseconfig';
import { doc, writeBatch, getDoc, getFirestore } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../lib/context'



export default function EnterPage(props) {
    const { user, username } = useContext(UserContext);
    // const user = null;
    // const username = null;

    //1. user signed out <SignInButton />
    //2. user signed in, but missing username <UsernameForm />
    //3. user signed in, has username <SignOutButton />

    return (
        <main>
            {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
        </main>
    )
}

//sign in with Google Button
function SignInButton() {
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider);
    }

    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} /> Sign in with Google 
        </button>
    )
}

//sign out button
    function SignOutButton() {
        return <button onClick={() => signOut(auth, console.log("test"))}>Sign Out</button>
}



function UsernameForm() {
     const [formValue, setFormValue] = useState('');
     const [isValid, setIsValid] = useState(false);
     const [loading, setLoading] = useState(false);

     const { user, username } = useContext(UserContext); 


     const onChange = (e) => {
        //force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

        //only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);

        if (re.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    }

    useEffect(() => {
        checkUsername(formValue);
      }, [formValue]);


    // Hit the database for username match after each debounced change
    // useCallback is required for debounce to work
    const checkUsername = useCallback (
    debounce(async (username) => {
        if (username.length >= 3) {
            const ref = doc(getFirestore(), 'usernames', username);
            const { exists } = await getDoc(ref);
            console.log('Firestore read executed!');
            setIsValid(!exists);
            setLoading(false); 
        }
    }, 500),
    []
    )

     return (
        !username && (
            <section>
                <h3>Choose Username</h3>
                <form onSubmit={onSubmit}>
                    <input name="username" placeholder="username" value={formValue} onChange={onChange} />
                    <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
                    <button type="submit" className="btn-green" disabled={!isValid}>
                    Choose
                    </button>
                    
                    <h3>Debug State</h3>
                    <div>
                        Username: {formValue}
                        <br />
                        Loading: {loading.toString()}
                        <br />
                        Username Valid: {isValid.toString()}
                    </div>
                </form>
            </section>
        )
     );
}

function UsernameMessage({ username, isValid, loading }) {
    if (loading) {
      return <p>Checking...</p>;
    } else if (isValid) {
      return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid) {
      return <p className="text-danger">That username is taken!</p>;
    } else {
      return <p></p>;
    }
  }
}

