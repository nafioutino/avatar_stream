<template>
  <div
    class="bg-[url('./img/back.svg')] bg-cover bg-center bg-no-repeat text-white min-h-screen"
  >
    <main
      class="container flex flex-col items-center px-4 sm:px-8 mx-auto p-10"
    >
      <article
        class="w-full max-w-xl sm:max-w-2xl h-[300px] sm:h-[600px] flex justify-center items-center bg-blue-200 bg-transparent mb-5"
      >
        <section class="w-full h-full">
          <video
            id="avatarVideo"
            class="w-full h-full object-cover"
            autoplay
            playsinline
          ></video>
        </section>
      </article>

      <div class="flex gap-2">
        <button
          :disabled="desactive"
          @click="initializeAvatarSession()"
          class="p-2 px-4 bg-[#f4a42b] rounded-lg text-white"
        >
          Commencer
        </button>
      </div>

      <!-- Buttons Section -->
    </main>
  </div>
</template>

<script setup lang="ts">
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";
import { onMounted, ref } from "vue";

let videoElement: HTMLVideoElement;
let questionsEnAttente: Question[] = [];
let avatar: StreamingAvatar | null = null;

const back_url = import.meta.env.VITE_BACKEND_URL;

const historyElement = document.getElementById(
  "conversationHistory"
) as HTMLParagraphElement; // Supposer qu'il existe une div avec cet ID

const desactive = ref(false);

onMounted(async () => {
  questionsEnAttente = await fetchQuestions();
  videoElement = document.getElementById("avatarVideo") as HTMLVideoElement;
});

// const sessionData:any = null;

interface Message {
  sender: string;
  message: string;
}

interface Question {
  id: number;
  question: string;
  status: string;
  firstName: string;
}

// // Initialiser l'historique avec le type défini
const conversationHistory: Message[] = [];

async function fetchQuestions(): Promise<Question[]> {
  try {
    const response = await fetch(`${back_url}/`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const data: Question[] = await response.json();
    const pendingQuestions = data.filter(
      (question) => question.status === "en attente"
    );
    // console.log(pendingQuestions);

    return pendingQuestions;
  } catch (error) {
    console.error("Erreur lors de la récupération des questions:", error);
    throw error;
  }
}

async function fetchAccessToken(): Promise<string> {
  const apiKey = import.meta.env.VITE_HEYGEN_API_KEY;
  const response = await fetch(
    "https://api.heygen.com/v1/streaming.create_token",
    { method: "POST", headers: { "x-api-key": apiKey } }
  );

  const { data } = await response.json();
  return data.token;
}

async function initializeAvatarSession() {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
  desactive.value = true;
  try {
    const token = await fetchAccessToken();
    avatar = new StreamingAvatar({ token });
    await avatar.createStartAvatar({
      quality: AvatarQuality.Medium,
      avatarName: "Dexter_Lawyer_Sitting_public",
      language: "Français",
    });
    // Configurez les événements
    avatar.on(StreamingEvents.STREAM_READY, (event) => {
      handleStreamReady(event);
      if (loader) loader.classList.add("hidden");
    });
    avatar.on(StreamingEvents.STREAM_DISCONNECTED, handleStreamDisconnected);
    setTimeout(handleSpeak, 10000);
  } catch (error) {
    console.error("Failed to initialize avatar session:", error);
    if (loader) loader.classList.add("hidden");
  }
}

function handleStreamReady(event: any) {
  if (event.detail && videoElement) {
    videoElement.srcObject = event.detail;
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch(console.error);
    };
  } else {
    console.error("Stream is not available");
  }
}

function handleStreamDisconnected() {
  // console.log("Stream disconnected");
  if (videoElement) {
    videoElement.srcObject = null;
  }
}

async function handleSpeak() {
  if (avatar) {
    const processedQuestions = new Set<number>(); // Pour garder une trace des questions déjà traitées

    try {
      while (true) {
        // Récupérer les nouvelles questions en attente
        const newQuestions = await fetchQuestions();
        for (const q of newQuestions) {
          if (!processedQuestions.has(q.id)) {
            const userQuestion = `Moi c'est ${q.firstName}, ${q.question}`;
            conversationHistory.push({ sender: "User", message: userQuestion });

            // Obtenir la réponse du backend
            const response = await fetch("http://127.0.0.1/assistant", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message: userQuestion }),
            });

            if (!response.ok) {
              throw new Error("Erreur lors de la communication avec l'assistant.");
            }

            const responseData = await response.json();
            console.log("Réponse de l'assistant:",responseData.response );
            console.log("Documents pertinents:",responseData.relevantDocs );
            const assistantResponse = responseData.response;

            // Faire parler l'avatar
            await avatar.speak({
              text: assistantResponse,
              taskType: TaskType.REPEAT,
            });

            console.log(assistantResponse);

            // Ajouter la réponse à l'historique
            conversationHistory.push({
              sender: "EvolveMind",
              message: assistantResponse,
            });

            // Mettre à jour l'affichage de la conversation
            updateConversationDisplay();

            // Mettre à jour le statut de la question en "terminé"
            await updateQuestionStatus(q.id, "terminé");

            // Ajouter l'ID de la question dans le Set pour éviter les doublons
            processedQuestions.add(q.id);

            // Pause avant de traiter la prochaine question
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }

        // Une fois toutes les questions traitées, poser la nouvelle question
        if (newQuestions.length === 0) {
          const additionalQuestion = `Anime un peu la galerie en parlant de Highfive University et du groupe VIPP Interstis.`;
          conversationHistory.push({
            sender: "User",
            message: additionalQuestion,
          });

          const additionalResponse = await fetch("http://127.0.0.1/assistant", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: additionalQuestion }),
          });

          if (!additionalResponse.ok) {
            throw new Error("Erreur lors de la communication avec l'assistant.");
          }

          const additionalResponseData = await additionalResponse.json();
          const additionalAssistantResponse = additionalResponseData.response;

          await avatar.speak({
            text: additionalAssistantResponse,
            taskType: TaskType.REPEAT,
          });

          console.log(additionalAssistantResponse);
          conversationHistory.push({
            sender: "EvolveMind",
            message: additionalAssistantResponse,
          });
          updateConversationDisplay();
          break;
        }

        // Attendre un moment avant de vérifier à nouveau
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error("Error getting response:", error);
    }
  }
}
// / Fonction pour mettre à jour le statut de la question
async function updateQuestionStatus(questionId: number, newStatus: string) {
  try {
    const response = await fetch(`${back_url}/update?id=${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du statut");
    }
    // console.log(`Statut de la question ${questionId} mis à jour en "${newStatus}"`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
  }
}

const formatRichText = (text: string) => {
  if (!text) return "";
  let formattedText = text;
  formattedText = formattedText.replace(
    /^# (.*?)$/gm,
    '<h1 style="color: white;">$1</h1>'
  );
  formattedText = formattedText.replace(
    /^## (.*?)$/gm,
    '<h2 style="color: white;">$1</h2>'
  );
  formattedText = formattedText.replace(
    /^### (.*?)$/gm,
    '<h3 style="color: white;">$1</h3>'
  );
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="color: white;">$1</strong>'
  );
  // Italique (texte)
  formattedText = formattedText.replace(
    /\*(.*?)\*/g,
    '<em style="color: white;">$1</em>'
  );
  // Texte barré (texte)
  formattedText = formattedText.replace(
    /~~(.*?)~~/g,
    '<del style="color: white;">$1</del>'
  );
  // Liens [texte](url)
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" style="color: white;">$1</a>'
  );
  // Listes à puces (- Élément)
  formattedText = formattedText.replace(
    /^- (.*?)$/gm,
    '<li style="color: white;">$1</li>'
  );
  formattedText = formattedText.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
  // Listes numérotées (1. Élément)
  formattedText = formattedText.replace(
    /^\d+\. (.*?)$/gm,
    '<li style="color: white;">$1</li>'
  );
  formattedText = formattedText.replace(/(<li>.*<\/li>)/g, "<ol>$1</ol>");
  // Saut de ligne
  formattedText = formattedText.replace(/\n/g, "<br />");
  return formattedText;
};

// Fonction pour afficher l'historique des messages dans l'interface
function updateConversationDisplay() {
  if (!historyElement) return;
  historyElement.innerHTML = "";
  // Parcourir l'historique et afficher chaque message
  conversationHistory.forEach(({ sender, message }) => {
    const messageElement = document.createElement("div");
    // Formate le message avec formatRichText
    const formattedMessage = formatRichText(message);
    // Utilise innerHTML pour injecter le texte formaté
    messageElement.innerHTML = `<strong class="font-bold text-[#f4a42b]">${sender} :</strong> ${formattedMessage}`;
    historyElement.appendChild(messageElement);
  });
}

setInterval(() => {
  fetchQuestions();
}, 3000);
</script>


