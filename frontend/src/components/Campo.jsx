/** Campo de formulário com rótulo. */
export default function Campo({ label, id, ...props }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} {...props} />
    </div>
  );
}
