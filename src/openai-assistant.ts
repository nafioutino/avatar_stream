// import OpenAI from "openai";
// import { retriever } from "./rag-system";
// export class OpenAIAssistant {
//   private client: OpenAI;
//   private assistant: any;
//   private thread: any;

//   constructor(apiKey:string) {
//     this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
//   }

//   async initialize(
//     instructions: string = `Tu es EVOLVE MIND,

//     Règles de comportement :
//     Langue et identification :

//     Réponds dans la langue utilisée par l’utilisateur. Identifie son nom, si disponible, et utilise-le pour personnaliser ton discours.
//     Personnalité et ton :
//     Tu es un(e) animateur(trice) de radio virtuel(le) énergique et captivant(e). Ton rôle est d'apporter de la joie, de l’humour, et une touche de répartie dans tes réponses. Inspire confiance, sois amical(e), et diffuse une énergie positive à chaque interaction.
//     Parle avec l’enthousiasme et l’imprévisibilité d’un(e) professionnel(le) des ondes, en alternant blagues légères, anecdotes et encouragements adaptés au contexte.
//     Traitement des questions :
//     Reformule systématiquement la question de l'utilisateur de manière naturelle et engageante, comme si tu "te connectais à ton audience". Exemple : “Ah, super question, [Nom]! Tu veux savoir…”
//     Sois direct(e) et affirmatif(ve), sans hésitations comme "il semble", "peut-être" ou "je pense". Transmets des réponses claires, mais ajoute un brin de malice ou d’humour léger pour garder une ambiance détendue.
//     Style conversationnel :
//     Utilise un langage chaleureux, inclusif, et dynamique, évitant les formulations robotiques ou trop formelles. Privilégie des expressions comme :
//     “Allez, attache ta ceinture, voici la réponse !”
//     “Ah, celle-là, c’est ma préférée, écoute bien…”
//     N’hésite pas à ponctuer tes réponses de phrases motivantes ou humoristiques pour laisser un sourire à ton utilisateur, comme un animateur qui finit toujours sur une note positive.`
//   ) {
//     // Create an assistant
//     this.assistant = await this.client.beta.assistants.create({
//       name: "Assistant Evolve Mind",
//       instructions,
//       tools: [],
//       model: "gpt-4",
//     });

//     // Create a thread
//     this.thread = await this.client.beta.threads.create();
//   }

//   async getResponse(userMessage: string): Promise<string> {
//     if (!this.assistant || !this.thread) {
//         throw new Error("Assistant not initialized. Call initialize() first.");
//     }


//     // Récupérer les documents pertinents avec le retriever
//     const relevantDocs = await retriever.getRelevantDocuments(userMessage);
//     // console.log(relevantDocs);
//     const context = relevantDocs
//         .map((doc: any) => doc.pageContent) // Extraire le contenu des documents
//         .join("\n\n"); // Combiner les documents en un seul contexte textuel

//     //  Ajouter le contexte au message de l'utilisateur
//     const promptWithDocs = `
//         Voici des informations pertinentes basées sur des données récupérées :
//         ${context}

//         Question de l'utilisateur :
//         ${userMessage}
//     `;

//     // Ajouter le message au thread
//     await this.client.beta.threads.messages.create(this.thread.id, {
//         role: "user",
//         content: promptWithDocs,
//     });

//     const run = await this.client.beta.threads.runs.createAndPoll(
//         this.thread.id,
//         { assistant_id: this.assistant.id }
//     );

//     if (run.status === "completed") {
//         // Récupérer les messages générés par l'assistant
//         const messages = await this.client.beta.threads.messages.list(
//             this.thread.id
//         );

//         // Trouver le dernier message de l'assistant
//         const lastMessage = messages.data.filter(
//             (msg: any) => msg.role === "assistant"
//         )[0];

//         if (lastMessage && lastMessage.content[0].type === "text") {
//             return lastMessage.content[0].text.value;
//         }
//     }

//     return "Désolé, je n'ai pas pu traiter votre requête.";
// }

// }

