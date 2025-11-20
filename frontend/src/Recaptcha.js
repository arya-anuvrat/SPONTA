import React from "react";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { firebaseConfig } from "../src/services/firebase"; // IMPORTANT: correct path

export default function Recaptcha({ recaptchaRef }) {
    return (
        <FirebaseRecaptchaVerifierModal
            ref={recaptchaRef}
            firebaseConfig={firebaseConfig}
            attemptInvisibleVerification={true}
        />
    );
}
