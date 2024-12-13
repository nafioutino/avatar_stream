<template>
  <div class="bg-[url('../assets/img/back.svg')] bg-cover bg-center bg-no-repeat text-white min-h-screen flex items-center justify-center">
    <form @submit.prevent="handleSubmit" class="bg-black bg-opacity-40 p-8 rounded-xl m-4 shadow-2xl max-w-lg w-full">
      <h2 class="text-4xl font-bold text-center mb-8 text-white">Posez Votre Question</h2>

      <!-- Champ Prénom -->
      <label for="firstName" class="block text-sm font-semibold mb-2 text-gray-300">Prénom</label>
      <input
        v-model="form.firstName"
        type="text"
        id="firstName"
        name="firstName"
        placeholder="Entrez votre prénom"
        aria-label="Prénom"
        required
        class="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6 text-white"
      />

      <!-- Champ Nom -->
      <label for="lastName" class="block text-sm font-semibold mb-2 text-gray-300">Nom</label>
      <input
        v-model="form.lastName"
        type="text"
        id="lastName"
        name="lastName"
        placeholder="Entrez votre nom"
        aria-label="Nom"
        required
        class="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6 text-white"
      />

      <!-- Champ Question -->
      <label for="question" class="block text-sm font-semibold mb-2 text-gray-300">Votre Question</label>
      <textarea
        v-model="form.question"
        id="question"
        name="question"
        rows="5"
        placeholder="Posez votre question ici..."
        aria-label="Votre Question"
        required
        class="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6 text-white"
      ></textarea>

      <!-- Bouton Envoyer -->
      <button
        type="submit"
        class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-lg transition-all flex justify-center items-center shadow-lg"
      >
        Envoyer
        <svg xmlns="http://www.w3.org/2000/svg" class="ml-3" height="24" viewBox="0 0 496 512" fill="#ffffff">
          <path
            d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import Swal from "sweetalert2";
import { reactive } from "vue";
const back_url = import.meta.env.VITE_BACKEND_URL;


interface FormData {
  firstName: string;
  lastName: string;
  question: string;
}

const form = reactive<FormData>({
  firstName: "",
  lastName: "",
  question: "",
});

const handleSubmit = async () => {
  if (!form.firstName || !form.lastName || !form.question) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Tous les champs doivent être remplis.",
    });
    return;
  }

  const formData = { ...form };

  // Afficher dans la console
  console.log("Données du formulaire :", formData);
  console.log("back url :", back_url);

  try {
    // Requête POST
    const response = await fetch(`${back_url}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la requête");
    }

    Swal.fire({
      icon: "success",
      title: `Merci ${form.firstName} ${form.lastName}`,
      text: "Votre question a été envoyée avec succès !",
      showConfirmButton: false,
      timer: 2000,
    });

    // Réinitialiser le formulaire
    form.firstName = "";
    form.lastName = "";
    form.question = "";
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Une erreur est survenue lors de l'envoi.",
    });
  }
};
</script>

<style scoped>
/* Ajoutez des styles si nécessaire */
</style>
