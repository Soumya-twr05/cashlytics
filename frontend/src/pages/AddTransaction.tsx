// // import { useState } from "react";
// // import * as api from "../lib/api";

// // interface AddTransactionProps {
// //   onSuccess?: () => void;
// //   onCancel?: () => void;
// // }

// // const CATEGORIES = [
// //   "Food",
// //   "Transport",
// //   "Shopping",
// //   "Bills",
// //   "Entertainment",
// //   "Healthcare",
// //   "Lifestyle",
// //   "Utilities",
// //   "Other",
// // ];

// // export default function AddTransaction({ onSuccess, onCancel }: AddTransactionProps) {
// //   const [description, setDescription] = useState("");
// //   const [amount, setAmount] = useState("");
// //   const [category, setCategory] = useState("Other");
// //   const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
// //   const [type, setType] = useState<"debit" | "credit">("debit");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [predictedCategory, setPredictedCategory] = useState<string | null>(null);

// //   const handlePredictCategory = async () => {
// //     if (!description.trim()) {
// //       setError("Enter a description first");
// //       return;
// //     }

// //     try {
// //       const prediction = await api.predictTransactionCategory(description);
// //       setPredictedCategory((prediction as any).category);
// //       setCategory((prediction as any).category);
// //       setError("");
// //     } catch (e) {
// //       console.error("Prediction error:", e);
// //       setError("Could not predict category");
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     if (!description.trim() || !amount) {
// //       setError("Please fill in all required fields");
// //       return;
// //     }

// //     if (parseFloat(amount) <= 0) {
// //       setError("Amount must be greater than 0");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const transactionData = {
// //         description: description.trim(),
// //         amount: Math.abs(parseFloat(amount)), // Ensure positive amount
// //         category,
// //         date: new Date(date).toISOString().split("T")[0], // Ensure valid date format
// //       };

// //       await api.createTransaction(transactionData);
      
// //       setError("");
// //       setDescription("");
// //       setAmount("");
// //       setCategory("Other");
// //       setDate(new Date().toISOString().split("T")[0]);
// //       setType("debit");
// //       setPredictedCategory(null);
      
// //       if (onSuccess) onSuccess();
// //     } catch (e) {
// //       const errorMsg = (e as any).message || "Failed to add transaction";
// //       console.error("Transaction error:", errorMsg);
// //       setError(errorMsg);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div
// //       className="rounded-xl p-6 fixed inset-0 flex items-center justify-center z-50"
// //       style={{ background: "rgba(0,0,0,0.5)" }}
// //     >
// //       <div
// //         className="w-full max-w-md rounded-xl p-6"
// //         style={{ background: "var(--card)", border: "1px solid var(--border)" }}
// //       >
// //         <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>
// //           Add Transaction
// //         </h2>

// //         {error && (
// //           <div
// //             className="p-3 rounded mb-4 text-sm"
// //             style={{
// //               background: "rgba(232, 93, 93, 0.08)",
// //               borderLeft: "3px solid var(--expense)",
// //               color: "var(--foreground)",
// //             }}
// //           >
// //             {error}
// //           </div>
// //         )}

// //         <div className="space-y-4">
// //           {/* Type */}
// //           <div>
// //             <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
// //               Type
// //             </label>
// //             <select
// //               value={type}
// //               onChange={(e) => setType(e.target.value as "debit" | "credit")}
// //               className="w-full px-3 py-2 rounded border text-sm"
// //               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
// //             >
// //               <option value="debit">Expense</option>
// //               <option value="credit">Income</option>
// //             </select>
// //           </div>

// //           {/* Description */}
// //           <div>
// //             <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
// //               Description
// //             </label>
// //             <input
// //               type="text"
// //               value={description}
// //               onChange={(e) => setDescription(e.target.value)}
// //               placeholder="Coffee at Starbucks"
// //               className="w-full px-3 py-2 rounded border text-sm"
// //               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
// //             />
// //           </div>

// //           {/* Amount */}
// //           <div>
// //             <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
// //               Amount (₹)
// //             </label>
// //             <input
// //               type="number"
// //               value={amount}
// //               onChange={(e) => setAmount(e.target.value)}
// //               placeholder="100"
// //               className="w-full px-3 py-2 rounded border text-sm"
// //               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
// //             />
// //           </div>

// //           {/* Category */}
// //           <div>
// //             <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
// //               Category {predictedCategory && `(Suggested: ${predictedCategory})`}
// //             </label>
// //             <select
// //               value={category}
// //               onChange={(e) => setCategory(e.target.value)}
// //               className="w-full px-3 py-2 rounded border text-sm"
// //               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
// //             >
// //               {CATEGORIES.map((cat) => (
// //                 <option key={cat} value={cat}>
// //                   {cat}
// //                 </option>
// //               ))}
// //             </select>
// //             <button
// //               onClick={handlePredictCategory}
// //               className="mt-2 text-xs font-medium"
// //               style={{ color: "var(--primary)" }}
// //             >
// //               Suggest Category with AI →
// //             </button>
// //           </div>

// //           {/* Date */}
// //           <div>
// //             <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
// //               Date
// //             </label>
// //             <input
// //               type="date"
// //               value={date}
// //               onChange={(e) => setDate(e.target.value)}
// //               className="w-full px-3 py-2 rounded border text-sm"
// //               style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
// //             />
// //           </div>
// //         </div>

// //         <div className="flex gap-3 mt-6">
// //           <button
// //             onClick={onCancel}
// //             className="flex-1 px-4 py-2 rounded border text-sm font-medium"
// //             style={{
// //               borderColor: "var(--border)",
// //               color: "var(--foreground)",
// //               background: "var(--background)",
// //             }}
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={handleSubmit}
// //             disabled={loading}
// //             className="flex-1 px-4 py-2 rounded text-sm font-medium"
// //             style={{
// //               background: "var(--primary)",
// //               color: "var(--primary-foreground)",
// //               opacity: loading ? 0.7 : 1,
// //             }}
// //           >
// //             {loading ? "Adding..." : "Add Transaction"}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import * as api from "../lib/api";

// interface AddTransactionProps {
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }

// export default function AddTransaction({
//   onSuccess,
//   onCancel,
// }: AddTransactionProps) {
//   const [description, setDescription] = useState("");
//   const [amount, setAmount] = useState("");
//   const [date, setDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [type, setType] = useState<"debit" | "credit">("debit");

//   const [category, setCategory] = useState("");
//   const [confidence, setConfidence] = useState<number | null>(null);

//   const [predicting, setPredicting] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");
//   const [aiMessage, setAiMessage] = useState(
//     "Enter a description and amount. Cashlytics will categorize it automatically."
//   );

//   /*
//    * ---------------------------------------------------------
//    * AUTOMATIC AI CATEGORY PREDICTION
//    * ---------------------------------------------------------
//    *
//    * We wait until the user has entered:
//    *   1. Description
//    *   2. Amount
//    *
//    * Then we wait 700ms after the last change before calling
//    * the ML service.
//    *
//    * This prevents an API request on every keystroke.
//    */
//   useEffect(() => {
//     const cleanDescription = description.trim();
//     const numericAmount = Number(amount);

//     // Nothing to predict yet
//     if (!cleanDescription || !amount || numericAmount <= 0) {
//       setCategory("");
//       setConfidence(null);

//       setAiMessage(
//         "Enter a description and amount. Cashlytics will categorize it automatically."
//       );

//       return;
//     }

//     let cancelled = false;

//     const timer = window.setTimeout(async () => {
//       try {
//         setPredicting(true);
//         setError("");

//         setAiMessage("Cashlytics AI is analyzing this transaction...");

//         const prediction =
//           await api.predictTransactionCategory(
//             cleanDescription,
//             numericAmount
//           );

//         if (cancelled) return;

//         setCategory(prediction.category);
//         setConfidence(prediction.confidence);

//         const confidencePercent =
//           prediction.confidence <= 1
//             ? prediction.confidence * 100
//             : prediction.confidence;

//         setAiMessage(
//           `AI categorized this as ${prediction.category} with ${confidencePercent.toFixed(
//             1
//           )}% confidence.`
//         );
//       } catch (e) {
//         if (cancelled) return;

//         console.error("Category prediction error:", e);

//         setCategory("");
//         setConfidence(null);

//         setAiMessage(
//           "Cashlytics could not categorize this transaction automatically."
//         );
//       } finally {
//         if (!cancelled) {
//           setPredicting(false);
//         }
//       }
//     }, 700);

//     return () => {
//       cancelled = true;
//       window.clearTimeout(timer);
//     };
//   }, [description, amount]);

//   /*
//    * ---------------------------------------------------------
//    * SUBMIT TRANSACTION
//    * ---------------------------------------------------------
//    *
//    * The category is NOT manually entered.
//    *
//    * If AI has not categorized the transaction yet, we make
//    * one final prediction before saving.
//    */
//   const handleSubmit = async () => {
//     const cleanDescription = description.trim();
//     const numericAmount = Number(amount);

//     setError("");

//     if (!cleanDescription) {
//       setError("Please enter a transaction description.");
//       return;
//     }

//     if (!amount || numericAmount <= 0) {
//       setError("Please enter an amount greater than 0.");
//       return;
//     }

//     if (!date) {
//       setError("Please select a date.");
//       return;
//     }

//     setLoading(true);

//     try {
//       let finalCategory = category;

//       /*
//        * If prediction hasn't completed yet, perform it now.
//        * This ensures we never save a transaction without
//        * an AI-generated category.
//        */
//       if (!finalCategory) {
//         setAiMessage("Analyzing transaction before saving...");

//         const prediction =
//           await api.predictTransactionCategory(
//             cleanDescription,
//             numericAmount
//           );

//         finalCategory = prediction.category;

//         setCategory(prediction.category);
//         setConfidence(prediction.confidence);
//       }

//       const transactionData = {
//         description: cleanDescription,
//         amount: Math.abs(numericAmount),
//         category: finalCategory,
//         type,
//         date,
//         source: "Manual",
//       };

//       await api.createTransaction(transactionData);

//       /*
//        * Reset form after successful transaction.
//        */
//       setDescription("");
//       setAmount("");
//       setCategory("");
//       setConfidence(null);
//       setDate(new Date().toISOString().split("T")[0]);
//       setType("debit");

//       setAiMessage(
//         "Transaction added successfully."
//       );

//       if (onSuccess) {
//         onSuccess();
//       }
//     } catch (e) {
//       const errorMsg =
//         e instanceof Error
//           ? e.message
//           : "Failed to add transaction.";

//       console.error("Transaction error:", errorMsg);

//       setError(errorMsg);

//       setAiMessage(
//         "Something went wrong while processing the transaction."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /*
//    * Convert confidence to percentage safely.
//    *
//    * Your ML service returns values between 0 and 1,
//    * but this also handles 0-100 values defensively.
//    */
//   const confidencePercent =
//     confidence !== null
//       ? confidence <= 1
//         ? confidence * 100
//         : confidence
//       : null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{
//         background: "rgba(0, 0, 0, 0.5)",
//       }}
//     >
//       <div
//         className="w-full max-w-md rounded-xl p-6"
//         style={{
//           background: "var(--card)",
//           border: "1px solid var(--border)",
//           maxHeight: "90vh",
//           overflowY: "auto",
//         }}
//       >
//         {/* Header */}
//         <div className="mb-5">
//           <h2
//             className="text-lg font-bold"
//             style={{ color: "var(--foreground)" }}
//           >
//             Add Transaction
//           </h2>

//           <p
//             className="text-xs mt-1"
//             style={{ color: "var(--muted-foreground)" }}
//           >
//             Tell Cashlytics what happened. AI will understand
//             and categorize it automatically.
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div
//             className="p-3 rounded mb-4 text-sm"
//             style={{
//               background: "rgba(232, 93, 93, 0.08)",
//               borderLeft: "3px solid var(--expense)",
//               color: "var(--foreground)",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         <div className="space-y-4">
//           {/* Transaction Type */}
//           <div>
//             <label
//               className="block text-xs font-medium mb-2"
//               style={{
//                 color: "var(--muted-foreground)",
//               }}
//             >
//               Type
//             </label>

//             <select
//               value={type}
//               onChange={(e) =>
//                 setType(
//                   e.target.value as "debit" | "credit"
//                 )
//               }
//               className="w-full px-3 py-2 rounded border text-sm"
//               style={{
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//                 background: "var(--background)",
//               }}
//             >
//               <option value="debit">
//                 Expense
//               </option>

//               <option value="credit">
//                 Income
//               </option>
//             </select>
//           </div>

//           {/* Description */}
//           <div>
//             <label
//               className="block text-xs font-medium mb-2"
//               style={{
//                 color: "var(--muted-foreground)",
//               }}
//             >
//               What was this transaction?
//             </label>

//             <input
//               type="text"
//               value={description}
//               onChange={(e) =>
//                 setDescription(e.target.value)
//               }
//               placeholder="e.g. Swiggy dinner"
//               className="w-full px-3 py-2 rounded border text-sm"
//               style={{
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//                 background: "var(--background)",
//               }}
//             />

//             <p
//               className="text-[11px] mt-1.5"
//               style={{
//                 color: "var(--muted-foreground)",
//               }}
//             >
//               You can write naturally, like "Uber to college"
//               or "monthly electricity bill".
//             </p>
//           </div>

//           {/* Amount */}
//           <div>
//             <label
//               className="block text-xs font-medium mb-2"
//               style={{
//                 color: "var(--muted-foreground)",
//               }}
//             >
//               Amount (₹)
//             </label>

//             <input
//               type="number"
//               min="1"
//               step="0.01"
//               value={amount}
//               onChange={(e) =>
//                 setAmount(e.target.value)
//               }
//               placeholder="500"
//               className="w-full px-3 py-2 rounded border text-sm"
//               style={{
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//                 background: "var(--background)",
//               }}
//             />
//           </div>

//           {/* AI Understanding Card */}
//           <div
//             className="rounded-lg p-4"
//             style={{
//               background:
//                 "rgba(16, 185, 129, 0.06)",
//               border:
//                 "1px solid rgba(16, 185, 129, 0.18)",
//             }}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <div
//                   className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
//                   style={{
//                     background:
//                       "rgba(16, 185, 129, 0.12)",
//                     color: "var(--primary)",
//                   }}
//                 >
//                   AI
//                 </div>

//                 <span
//                   className="text-sm font-semibold"
//                   style={{
//                     color: "var(--foreground)",
//                   }}
//                 >
//                   Cashlytics Intelligence
//                 </span>
//               </div>

//               {predicting && (
//                 <span
//                   className="text-[11px]"
//                   style={{
//                     color: "var(--primary)",
//                   }}
//                 >
//                   Analyzing...
//                 </span>
//               )}
//             </div>

//             {category ? (
//               <div>
//                 <div
//                   className="text-xs mb-1"
//                   style={{
//                     color:
//                       "var(--muted-foreground)",
//                   }}
//                 >
//                   Detected category
//                 </div>

//                 <div
//                   className="flex items-center justify-between"
//                 >
//                   <span
//                     className="font-semibold text-sm"
//                     style={{
//                       color: "var(--foreground)",
//                     }}
//                   >
//                     {category}
//                   </span>

//                   {confidencePercent !== null && (
//                     <span
//                       className="text-xs font-medium"
//                       style={{
//                         color: "var(--primary)",
//                       }}
//                     >
//                       {confidencePercent.toFixed(1)}%
//                       confidence
//                     </span>
//                   )}
//                 </div>

//                 <p
//                   className="text-[11px] mt-2"
//                   style={{
//                     color:
//                       "var(--muted-foreground)",
//                   }}
//                 >
//                   {aiMessage}
//                 </p>
//               </div>
//             ) : (
//               <p
//                 className="text-xs"
//                 style={{
//                   color:
//                     "var(--muted-foreground)",
//                 }}
//               >
//                 {aiMessage}
//               </p>
//             )}
//           </div>

//           {/* Date */}
//           <div>
//             <label
//               className="block text-xs font-medium mb-2"
//               style={{
//                 color: "var(--muted-foreground)",
//               }}
//             >
//               Date
//             </label>

//             <input
//               type="date"
//               value={date}
//               onChange={(e) =>
//                 setDate(e.target.value)
//               }
//               className="w-full px-3 py-2 rounded border text-sm"
//               style={{
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//                 background: "var(--background)",
//               }}
//             />
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="flex gap-3 mt-6">
//           <button
//             onClick={onCancel}
//             disabled={loading}
//             className="flex-1 px-4 py-2 rounded border text-sm font-medium"
//             style={{
//               borderColor: "var(--border)",
//               color: "var(--foreground)",
//               background: "var(--background)",
//               opacity: loading ? 0.6 : 1,
//             }}
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             disabled={
//               loading ||
//               predicting ||
//               !description.trim() ||
//               !amount
//             }
//             className="flex-1 px-4 py-2 rounded text-sm font-medium"
//             style={{
//               background: "var(--primary)",
//               color: "var(--primary-foreground)",
//               opacity:
//                 loading ||
//                 predicting ||
//                 !description.trim() ||
//                 !amount
//                   ? 0.6
//                   : 1,
//             }}
//           >
//             {loading
//               ? "Adding..."
//               : predicting
//               ? "Analyzing..."
//               : "Add Transaction"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import * as api from "../lib/api";

interface AddTransactionProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/*
 * ============================================================
 * CASHLYTICS CATEGORY NORMALIZATION
 * ============================================================
 *
 * The ML model and backend currently use slightly different
 * category vocabularies.
 *
 * ML:
 *   Transportation
 *
 * Backend:
 *   Transport
 *
 * We normalize the ML result before saving it.
 */

const CATEGORY_MAP: Record<string, string> = {
  Transportation: "Transport",
  Transport: "Transport",

  Food: "Food & Dining",
  "Food & Dining": "Food & Dining",

  Grocery: "Groceries",
  Groceries: "Groceries",

  Medical: "Healthcare",
  Healthcare: "Healthcare",

  Entertainment: "Entertainment",

  Shopping: "Shopping",

  Bills: "Bills",

  Education: "Education",

  Investment: "Investment",

  Financial: "Investment",

  Income: "Income",

  Transfer: "Transfer",

  Lifestyle: "Lifestyle",

  Electronics: "Electronics",

  Other: "Other",
};

/**
 * Convert an ML category into the category vocabulary
 * used by the Cashlytics backend.
 */
function normalizeCategory(category: string): string {
  const cleanedCategory = category.trim();

  return (
    CATEGORY_MAP[cleanedCategory] ||
    "Other"
  );
}

export default function AddTransaction({
  onSuccess,
  onCancel,
}: AddTransactionProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [type, setType] =
    useState<"debit" | "credit">("debit");

  const [category, setCategory] = useState("");

  const [confidence, setConfidence] =
    useState<number | null>(null);

  const [predicting, setPredicting] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [aiMessage, setAiMessage] = useState(
    "Enter a description and amount. Cashlytics will categorize it automatically."
  );

  /*
   * ============================================================
   * AUTOMATIC CATEGORY PREDICTION
   * ============================================================
   */

  useEffect(() => {
    const cleanDescription =
      description.trim();

    const numericAmount =
      Number(amount);

    /*
     * Don't call ML until we have enough
     * information.
     */
    if (
      !cleanDescription ||
      !amount ||
      numericAmount <= 0
    ) {
      setCategory("");
      setConfidence(null);

      setAiMessage(
        "Enter a description and amount. Cashlytics will categorize it automatically."
      );

      return;
    }

    let cancelled = false;

    /*
     * Small debounce.
     *
     * This prevents an ML request on every
     * keystroke while the user is typing.
     */
    const timer = window.setTimeout(
      async () => {
        try {
          setPredicting(true);
          setError("");

          setAiMessage(
            "Cashlytics AI is analyzing this transaction..."
          );

          const prediction =
            await api.predictTransactionCategory(
              cleanDescription,
              numericAmount
            );

          if (cancelled) return;

          /*
           * Normalize the category returned by ML.
           */
          const normalizedCategory =
            normalizeCategory(
              prediction.category
            );

          setCategory(
            normalizedCategory
          );

          setConfidence(
            prediction.confidence
          );

          const confidencePercent =
            prediction.confidence <= 1
              ? prediction.confidence * 100
              : prediction.confidence;

          setAiMessage(
            `AI categorized this as ${normalizedCategory} with ${confidencePercent.toFixed(
              1
            )}% confidence.`
          );
        } catch (e) {
          if (cancelled) return;

          console.error(
            "Category prediction error:",
            e
          );

          setCategory("");
          setConfidence(null);

          setAiMessage(
            "Cashlytics could not categorize this transaction automatically."
          );
        } finally {
          if (!cancelled) {
            setPredicting(false);
          }
        }
      },
      700
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [description, amount]);

  /*
   * ============================================================
   * ADD TRANSACTION
   * ============================================================
   */

  const handleSubmit = async () => {
    const cleanDescription =
      description.trim();

    const numericAmount =
      Number(amount);

    setError("");

    /*
     * Basic validation.
     */

    if (!cleanDescription) {
      setError(
        "Please enter a transaction description."
      );
      return;
    }

    if (
      !amount ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter an amount greater than 0."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select a date."
      );
      return;
    }

    setLoading(true);

    try {
      let finalCategory =
        category;

      /*
       * If prediction hasn't finished yet,
       * make one final ML request.
       */
      if (!finalCategory) {
        setAiMessage(
          "Analyzing transaction before saving..."
        );

        const prediction =
          await api.predictTransactionCategory(
            cleanDescription,
            numericAmount
          );

        finalCategory =
          normalizeCategory(
            prediction.category
          );

        setCategory(
          finalCategory
        );

        setConfidence(
          prediction.confidence
        );
      }

      /*
       * Final safety normalization.
       *
       * This guarantees the backend receives
       * a category from its allowed vocabulary.
       */
      finalCategory =
        normalizeCategory(
          finalCategory
        );

      /*
       * Send transaction to backend.
       *
       * The user never has to manually choose
       * the category.
       */
      await api.createTransaction({
        description:
          cleanDescription,

        amount:
          Math.abs(numericAmount),

        category:
          finalCategory,

        type,

        date,

        source:
          "Manual",
      });

      /*
       * Reset form.
       */

      setDescription("");
      setAmount("");
      setCategory("");
      setConfidence(null);

      setDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      setType("debit");

      setAiMessage(
        "Transaction added successfully."
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to add transaction.";

      console.error(
        "Transaction error:",
        errorMessage
      );

      setError(
        errorMessage
      );

      setAiMessage(
        "Something went wrong while saving the transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * CONFIDENCE DISPLAY
   * ============================================================
   */

  const confidencePercent =
    confidence !== null
      ? confidence <= 1
        ? confidence * 100
        : confidence
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          background:
            "var(--card)",

          border:
            "1px solid var(--border)",

          maxHeight:
            "90vh",

          overflowY:
            "auto",
        }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-5">
          <h2
            className="text-lg font-bold"
            style={{
              color:
                "var(--foreground)",
            }}
          >
            Add Transaction
          </h2>

          <p
            className="text-xs mt-1"
            style={{
              color:
                "var(--muted-foreground)",
            }}
          >
            Tell Cashlytics what happened.
            AI will understand and
            categorize it automatically.
          </p>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div
            className="p-3 rounded mb-4 text-sm"
            style={{
              background:
                "rgba(232, 93, 93, 0.08)",

              borderLeft:
                "3px solid var(--expense)",

              color:
                "var(--foreground)",
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* ================================================= */}
          {/* TYPE */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "debit"
                    | "credit"
                )
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            >
              <option value="debit">
                Expense
              </option>

              <option value="credit">
                Income
              </option>
            </select>
          </div>

          {/* ================================================= */}
          {/* DESCRIPTION */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              What was this transaction?
            </label>

            <input
              type="text"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="e.g. Uber to college"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />

            <p
              className="text-[11px] mt-1.5"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Write naturally, for example
              "Swiggy dinner", "Uber to college",
              or "electricity bill".
            </p>
          </div>

          {/* ================================================= */}
          {/* AMOUNT */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Amount (₹)
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="500"
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />
          </div>

          {/* ================================================= */}
          {/* AI INTELLIGENCE */}
          {/* ================================================= */}

          <div
            className="rounded-lg p-4"
            style={{
              background:
                "rgba(16, 185, 129, 0.06)",

              border:
                "1px solid rgba(16, 185, 129, 0.18)",
            }}
          >
            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-2">

                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      "rgba(16, 185, 129, 0.12)",

                    color:
                      "var(--primary)",
                  }}
                >
                  AI
                </div>

                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      "var(--foreground)",
                  }}
                >
                  Cashlytics Intelligence
                </span>

              </div>

              {predicting && (
                <span
                  className="text-[11px]"
                  style={{
                    color:
                      "var(--primary)",
                  }}
                >
                  Analyzing...
                </span>
              )}

            </div>

            {category ? (
              <div>

                <div
                  className="text-xs mb-1"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Detected category
                </div>

                <div className="flex items-center justify-between">

                  <span
                    className="font-semibold text-sm"
                    style={{
                      color:
                        "var(--foreground)",
                    }}
                  >
                    {category}
                  </span>

                  {confidencePercent !== null && (
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          "var(--primary)",
                      }}
                    >
                      {confidencePercent.toFixed(
                        1
                      )}
                      % confidence
                    </span>
                  )}

                </div>

                <p
                  className="text-[11px] mt-2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {aiMessage}
                </p>

              </div>
            ) : (
              <p
                className="text-xs"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {aiMessage}
              </p>
            )}
          </div>

          {/* ================================================= */}
          {/* DATE */}
          {/* ================================================= */}

          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                borderColor:
                  "var(--border)",

                color:
                  "var(--foreground)",

                background:
                  "var(--background)",
              }}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex gap-3 mt-6">

          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded border text-sm font-medium"
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--foreground)",

              background:
                "var(--background)",

              opacity:
                loading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              predicting ||
              !description.trim() ||
              !amount
            }
            className="flex-1 px-4 py-2 rounded text-sm font-medium"
            style={{
              background:
                "var(--primary)",

              color:
                "var(--primary-foreground)",

              opacity:
                loading ||
                predicting ||
                !description.trim() ||
                !amount
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? "Adding..."
              : predicting
              ? "Analyzing..."
              : "Add Transaction"}
          </button>

        </div>
      </div>
    </div>
  );
}