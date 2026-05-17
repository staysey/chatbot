export default function MessageBubble({ msg }) {
  return (
    <div
      className={`p-3 rounded-lg max-w-xs ${
        msg.sender === "user"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-gray-300 text-gray-800"
      }`}
    >
      <div>{msg.text}</div>
      {msg.attachments?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {msg.attachments.map((attachment, index) =>
            attachment.preview ? (
              <img
                key={index}
                src={attachment.preview}
                alt=""
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <span
                key={index}
                className="rounded-md bg-black/10 px-2 py-1 text-xs"
              >
                {attachment.name}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
