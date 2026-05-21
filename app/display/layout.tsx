// /**
//  * Display layout — fullscreen menggunakan 100dvh (dynamic viewport height)
//  * agar tidak kepotong oleh browser address bar / tab bar.
//  * cursor: none untuk tampilan TV.
//  */
// export default function DisplayLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100dvw",
//         height: "100dvh",
//         // overflow: "hidden",
//         // cursor: "none",
//       }}
//     >
//       {children}
//     </div>
//   );
// }


/**
 * Display layout — fullscreen menggunakan 100dvh (dynamic viewport height)
 * agar tidak kepotong oleh browser address bar / tab bar.
 * cursor: none untuk tampilan TV.
 */
export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
      }}
    >
      {children}
    </div>
  );
}
