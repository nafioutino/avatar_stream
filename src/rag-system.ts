// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// const back_url = import.meta.env.VITE_BACKEND_URL;

// // Fonction pour charger et extraire le texte de plusieurs PDF
// async function fetchAllDocs() {
//   try {
//     const response = await fetch(`${back_url}/alldocs`);
//     if (!response.ok) {
//       throw new Error(`Erreur HTTP : ${response.status}`);
//     }
//     const data: any[] = await response.json();
//     console.log(data);

//     return data;
//   } catch (error) {
//     console.error("Erreur lors de la récupération des pdf:", error);
//     throw error;
//   }
// }

// // Fonction pour diviser le texte en chunks
// const splitText = async (docs: any) => {
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     separators: ["\n", "\n\n", " ", ""],
//     chunkSize: 5000,
//     chunkOverlap: 200,
//   });

//   const splits = await textSplitter.splitDocuments(docs);
//   return splits;
// };

// async function main(): Promise<void | MemoryVectorStore> {
//   const docs = await fetchAllDocs();
//   const splits = await splitText(docs);
//   console.log(splits);

//   const vectorStore = await MemoryVectorStore.fromDocuments(
//     splits,
//     new ZhipuAIEmbeddings({ apiKey:"2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI" })
//   );
//   return vectorStore;
// }

// let retriever: any = null;
// main()
//   .then((vectorStore) => {
//     if (vectorStore) {
//       retriever = vectorStore.asRetriever();
//       console.log(retriever);
//     }
//   })
//   .catch(console.error);

// export { retriever };
