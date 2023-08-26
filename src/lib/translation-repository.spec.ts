import { firstValueFrom, lastValueFrom } from "rxjs";
import { TranslationRepository } from "./translation-repository";
import { EnvironmentController } from "./environment-controller";

let holder: TranslationRepository;
describe("Translation holder", () => {
  beforeAll(() => {
    EnvironmentController.getEnvironmentController("tr-tr", true);
    holder = new TranslationRepository();
  });
  describe("Translator holder basic operations", () => {
    it("Part should be registered", () => {
      holder.registerParts(
        {
          prefix: "generic",
          stringMap: {
            hello: "Merhaba, {name}",
          },
        },
        "tr-tr"
      );

      const translatedText = holder.getString({
        key: "generic.hello",
        parameters: {
          name: "Kyle",
        },
      });
      expect(translatedText).toEqual("Merhaba, Kyle");
    });

    it("Part should be registered and language should be change", () => {
      holder.registerParts(
        {
          prefix: "generic",
          stringMap: {
            hello: "Hello, {name}",
          },
        },
        "en-us"
      );
      EnvironmentController.getEnvironmentController().setLanguage("en-us");
      const translatedText = holder.getString({
        key: "generic.hello",
        parameters: {
          name: "Kyle",
        },
      });
      expect(translatedText).toEqual("Hello, Kyle");
    });

    it("Translated text should be changed after language change", async () => {
      EnvironmentController.getEnvironmentController().setLanguage("tr-tr");
      let text = "";
      holder
        .getStringListenChanges({
          key: "generic.hello",
          parameters: {
            name: "Kyle",
          },
        })
        .subscribe((a) => {
          text = a;
        });

      expect(text).toEqual("Merhaba, Kyle");
      EnvironmentController.getEnvironmentController().setLanguage("en-us");
      expect(text).toEqual("Hello, Kyle");
    });

    it("Local storage should be set", async () => {
      EnvironmentController.getEnvironmentController().setLanguage("tr-tr");
      expect(localStorage.getItem("CURRENT_LANGUAGE")).toEqual("tr-tr");
      EnvironmentController.getEnvironmentController().setLanguage("en-us");
      expect(localStorage.getItem("CURRENT_LANGUAGE")).toEqual("en-us");
    });
  });
});
