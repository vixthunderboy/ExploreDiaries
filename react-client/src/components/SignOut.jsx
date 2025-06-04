import { doSignOut } from "../firebase/FirebaseFunctions";

export default function SignOut() {
  return (
    <div>
      <button onClick={doSignOut}>Sign out</button>
    </div>
  );
}
