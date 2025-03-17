export default function TranslatorTestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Website Translator Test Page</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">This content should be translatable</h2>
        <p className="mb-4">
          This is a test page to verify that the Website Translator is working correctly.
          The text on this page should be translatable when you select a different language
          from the translator widget at the top of the page.
        </p>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget
          aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
          Donec euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
        </p>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">This content should NOT be translatable</h2>
        <p className="mb-4" translate="no">
          This paragraph has the translate="no" attribute, so it should not be translated
          by the Website Translator widget. It should remain in the original language
          regardless of which language is selected.
        </p>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Content with specific language</h2>
        <p className="mb-4" lang="fr">
          Ce paragraphe est en français. Il a l'attribut lang="fr", donc il devrait
          être reconnu comme du français par le traducteur de site Web.
        </p>
        <p className="mb-4" lang="es">
          Este párrafo está en español. Tiene el atributo lang="es", por lo que debería
          ser reconocido como español por el traductor del sitio web.
        </p>
      </div>
    </div>
  );
} 