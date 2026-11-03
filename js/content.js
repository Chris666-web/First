/*
 * Lerninhalte der App.
 *
 * Hier kannst du Texte ändern oder neue Lektionen ergänzen, ohne den Rest
 * des Programms anzufassen. Jede Lektion besteht aus "Schritten":
 *
 *   { type: "text",   title, body, points?, tip? }      Erklärung
 *   { type: "quiz",   q, options, correct, explain }    Frage (correct = Nummer der richtigen Antwort, ab 0)
 *   { type: "reflect", id, prompt, placeholder? }       eigene Gedanken notieren
 *   { type: "widget", widget, title, intro? }           interaktives Element aus widgets.js
 */
window.MODULES = [
  {
    id: "geld",
    title: "Geld & Finanzsystem",
    short: "Geld",
    icon: "coin",
    desc: "Was Geld ist, woher es kommt und warum es mit der Zeit an Wert verliert.",
    disclaimer: "Allgemeine Finanzbildung, keine Anlage- oder Steuerberatung.",
    lessons: [
      {
        id: "geld-1",
        title: "Was ist Geld eigentlich?",
        minutes: 4,
        steps: [
          {
            type: "text",
            title: "Geld ist eine Vereinbarung",
            body: "<p>Ein 20-Euro-Schein ist bedrucktes Baumwollpapier. Herstellen kostet er nur ein paar Cent. Trotzdem bekommst du dafür ein Essen.</p><p>Der Grund: Wir alle vertrauen darauf, dass auch andere den Schein annehmen. <strong>Geld ist im Kern geteiltes Vertrauen.</strong></p>"
          },
          {
            type: "widget",
            widget: "timeline",
            title: "Vom Tauschhandel zur App",
            intro: "Tippe dich durch die Geschichte des Geldes."
          },
          {
            type: "text",
            title: "Die drei Aufgaben von Geld",
            body: "<p>Ökonomen beschreiben Geld über das, was es leistet:</p>",
            points: [
              "<strong>Tauschmittel:</strong> Du musst nicht Brot gegen Haarschnitt tauschen. Geld passt immer.",
              "<strong>Wertaufbewahrung:</strong> Du kannst heute verdienen und nächsten Monat ausgeben.",
              "<strong>Recheneinheit:</strong> Ein Fahrrad für 400 € und ein Handy für 600 € lassen sich direkt vergleichen."
            ]
          },
          {
            type: "quiz",
            q: "Warum hat ein Euro-Schein Wert?",
            options: [
              "Weil für jeden Schein Gold bei der Zentralbank liegt",
              "Weil Menschen darauf vertrauen, dass er überall angenommen wird",
              "Weil das Papier besonders wertvoll ist"
            ],
            correct: 1,
            explain: "Seit 1971 sind die großen Währungen nicht mehr an Gold gebunden. Man spricht von Fiatgeld: Es gilt, weil der Staat es als Zahlungsmittel festlegt und die Menschen ihm vertrauen."
          },
          {
            type: "quiz",
            q: "Du vergleichst die Preise zweier Jacken. Welche Aufgabe des Geldes nutzt du gerade?",
            options: ["Tauschmittel", "Wertaufbewahrung", "Recheneinheit"],
            correct: 2,
            explain: "Als Recheneinheit macht Geld ganz unterschiedliche Dinge vergleichbar."
          },
          {
            type: "reflect",
            id: "geld-gefuehl",
            prompt: "Welches Gefühl verbindest du mit Geld? Sicherheit, Stress, Freiheit, Scham? Schreib es ehrlich auf. Nur du siehst das.",
            placeholder: "Wenn ich an Geld denke, fühle ich …"
          }
        ]
      },
      {
        id: "geld-2",
        title: "Wie entsteht Geld?",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Zwei Arten von Geld",
            body: "<p>Im Euroraum gibt es zwei Sorten Geld:</p>",
            points: [
              "<strong>Zentralbankgeld:</strong> Bargeld und die Guthaben der Banken bei der Zentralbank. Das schafft das Eurosystem, also die EZB zusammen mit Zentralbanken wie der Deutschen Bundesbank.",
              "<strong>Buchgeld:</strong> die Zahl auf deinem Girokonto. Rund neun von zehn Euro existieren nur in dieser Form."
            ],
            tip: "<strong>Überraschend:</strong> Buchgeld schaffen vor allem die normalen Geschäftsbanken, nicht die Zentralbank."
          },
          {
            type: "widget",
            widget: "moneyCreation",
            title: "Spiel es durch: Ein Kredit erschafft Geld",
            intro: "Lina braucht 10.000 € für ein Auto. Klicke dich durch, was in der Bilanz ihrer Bank passiert."
          },
          {
            type: "text",
            title: "Wer bremst das Gelddrucken der Banken?",
            body: "<p>Banken können nicht beliebig Kredite vergeben:</p>",
            points: [
              "Sie brauchen genug <strong>Eigenkapital</strong>, das schreiben Aufsichtsregeln vor.",
              "Sie brauchen Kunden, die den Kredit <strong>zurückzahlen können</strong>.",
              "Die Zentralbank steuert über den <strong>Leitzins</strong>, wie teuer Kredite sind. Hohe Zinsen bedeuten weniger Kredite und damit weniger neues Geld."
            ]
          },
          {
            type: "quiz",
            q: "Was passiert, wenn dir eine Bank einen Kredit gibt?",
            options: [
              "Sie gibt dir 1:1 das Ersparte anderer Kunden",
              "Sie schreibt dir neues Buchgeld gut. Es entsteht in diesem Moment",
              "Die Zentralbank druckt dafür neue Scheine"
            ],
            correct: 1,
            explain: "So beschreiben es auch die Bundesbank und die Bank of England: Mit dem Kredit entsteht neues Buchgeld. Wird er zurückgezahlt, verschwindet es wieder."
          },
          {
            type: "quiz",
            q: "Mit welchem Werkzeug beeinflusst die Zentralbank vor allem, wie viele Kredite vergeben werden?",
            options: ["Mit dem Leitzins", "Mit der Anzahl der Geldautomaten", "Mit Steuern"],
            correct: 0,
            explain: "Steuern legt die Politik fest. Die Zentralbank arbeitet mit dem Leitzins: Er bestimmt, wie teuer sich Banken Zentralbankgeld leihen."
          }
        ]
      },
      {
        id: "geld-3",
        title: "Inflation: der leise Wertverlust",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Was ist Inflation?",
            body: "<p>Inflation heißt: Die Preise steigen im Durchschnitt. Dein Euro kauft dann weniger als vorher.</p><p>Gemessen wird das mit einem <strong>Warenkorb</strong> aus typischen Ausgaben wie Miete, Lebensmitteln, Strom und Kleidung. Daraus entsteht der Verbraucherpreisindex.</p>",
            tip: "<strong>Ziel der EZB:</strong> etwa 2 % Inflation pro Jahr, auf mittlere Sicht."
          },
          {
            type: "widget",
            widget: "inflation",
            title: "So schrumpft deine Kaufkraft",
            intro: "Verschiebe die Regler und sieh, was 1.000 € in Zukunft noch wert sind, wenn sie einfach herumliegen."
          },
          {
            type: "text",
            title: "Warum ein bisschen Inflation gewollt ist",
            body: "<p>Fallende Preise klingen gut, sind aber gefährlich. Wenn alles nächstes Jahr billiger ist, warten Menschen mit dem Kaufen. Firmen verkaufen weniger und entlassen Leute.</p><p>Leichte Inflation hält die Wirtschaft in Bewegung. Für dich heißt das aber: <strong>Geld ohne Zinsen verliert jedes Jahr ein Stück seines Werts.</strong></p>"
          },
          {
            type: "quiz",
            q: "1.000 € liegen 10 Jahre unter dem Kopfkissen. Die Inflation beträgt 3 % pro Jahr. Was gilt danach?",
            options: [
              "Es sind noch 1.000 €, sie kaufen aber nur noch so viel wie heute rund 744 €",
              "Es sind nur noch 700 € im Kopfkissen",
              "Es hat sich nichts verändert"
            ],
            correct: 0,
            explain: "Der Betrag bleibt gleich, die Kaufkraft sinkt: 1.000 € ÷ 1,03¹⁰ ≈ 744 €."
          },
          {
            type: "quiz",
            q: "Faustregel: 70 geteilt durch die Inflationsrate ergibt, nach wie vielen Jahren sich die Kaufkraft halbiert. Wie lange dauert das bei 2 %?",
            options: ["Etwa 14 Jahre", "Etwa 35 Jahre", "Etwa 70 Jahre"],
            correct: 1,
            explain: "70 ÷ 2 = 35. Nach rund 35 Jahren kaufen 100 € nur noch so viel wie heute 50 €."
          },
          {
            type: "reflect",
            id: "inflation-alltag",
            prompt: "Wo merkst du steigende Preise in deinem Alltag am stärksten?"
          }
        ]
      },
      {
        id: "geld-4",
        title: "Zinseszins: Zeit arbeitet für dich",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Zinsen auf Zinsen",
            body: "<p>Legst du 1.000 € zu 5 % an, bekommst du im ersten Jahr 50 € Zinsen. Im zweiten Jahr bekommst du Zinsen auf 1.050 €, also 52,50 €. Im dritten auf 1.102,50 € …</p><p>Das ist der <strong>Zinseszins</strong>. Am Anfang wirkt er unscheinbar, nach Jahrzehnten wird er zur stärksten Kraft beim Vermögensaufbau.</p>"
          },
          {
            type: "widget",
            widget: "compound",
            title: "Dein Sparplan-Rechner",
            intro: "Wie viel kommt zusammen, wenn du jeden Monat einen festen Betrag anlegst? Fahre mit der Maus oder dem Finger über die Grafik."
          },
          {
            type: "text",
            title: "Die 72er-Regel",
            body: "<p>Eine Faustregel zum Kopfrechnen:</p><p class=\"big-fact\">72 ÷ Zinssatz</p><p>So viele Jahre dauert es ungefähr, bis sich dein Geld verdoppelt. Bei 6 % sind das etwa 12 Jahre, bei 3 % etwa 24 Jahre.</p>"
          },
          {
            type: "quiz",
            q: "Lena spart ab 25 jeden Monat 100 €, Tom ab 35 jeden Monat 150 €. Beide bis 65, beide mit 6 % Rendite. Wer hat am Ende mehr?",
            options: [
              "Tom, weil er insgesamt mehr einzahlt (54.000 € statt 48.000 €)",
              "Lena, mit rund 199.000 € gegenüber Toms rund 151.000 €",
              "Beide haben ungefähr gleich viel"
            ],
            correct: 1,
            explain: "Lena zahlt weniger ein, hat aber 10 Jahre mehr Zeit. Beim Zinseszins zählt Zeit oft mehr als die Höhe der Rate."
          },
          {
            type: "quiz",
            q: "Nach der 72er-Regel: Wie lange dauert die Verdopplung bei 8 % Rendite?",
            options: ["Etwa 6 Jahre", "Etwa 9 Jahre", "Etwa 16 Jahre"],
            correct: 1,
            explain: "72 ÷ 8 = 9 Jahre."
          },
          {
            type: "text",
            title: "Wichtig: Rendite ist nie garantiert",
            body: "<p>Breite Aktienmärkte haben über lange Zeiträume historisch im Schnitt etwa 6 bis 8 % pro Jahr gebracht. Das ist ein Rückblick und kein Versprechen. Einzelne Jahre können deutlich im Minus liegen.</p><p>Der Rechner zeigt eine gleichmäßige Entwicklung. In Wirklichkeit verläuft sie in Wellen.</p>"
          }
        ]
      }
    ]
  },
  {
    id: "werkzeuge",
    title: "Werkzeuge für dein Geld",
    short: "Werkzeuge",
    icon: "tools",
    desc: "Praktische Methoden: Budget, Notgroschen, ETFs und Risiko verstehen.",
    disclaimer: "Allgemeine Finanzbildung, keine Anlage- oder Steuerberatung.",
    lessons: [
      {
        id: "werkzeuge-1",
        title: "Das 50/30/20-Budget",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Drei Töpfe für dein Einkommen",
            body: "<p>Ein einfaches System für dein Nettoeinkommen:</p>",
            points: [
              "<strong>50 % Bedürfnisse:</strong> Miete, Lebensmittel, Versicherungen, Fahrtkosten.",
              "<strong>30 % Wünsche:</strong> Hobbys, Essen gehen, Urlaub, Abos.",
              "<strong>20 % Sparen:</strong> Notgroschen, Vermögensaufbau, Schulden tilgen."
            ],
            tip: "<strong>Kein Gesetz:</strong> In teuren Städten frisst die Miete oft mehr. Die Regel ist ein Startpunkt, den du anpasst."
          },
          {
            type: "widget",
            widget: "budget",
            title: "Teste dein Budget",
            intro: "Gib dein Netto ein und stelle ein, wie du heute ungefähr aufteilst."
          },
          {
            type: "text",
            title: "Zahl dich zuerst selbst",
            body: "<p>Der wirksamste Trick: Richte einen <strong>Dauerauftrag am Tag nach dem Gehaltseingang</strong> ein. So sparst du, bevor du überhaupt in Versuchung kommst. Was übrig bleibt, darfst du ohne schlechtes Gewissen ausgeben.</p>"
          },
          {
            type: "quiz",
            q: "In welchen Topf gehört ein Streaming-Abo?",
            options: ["Bedürfnisse", "Wünsche", "Sparen"],
            correct: 1,
            explain: "Schön, aber nicht lebensnotwendig, also ein Wunsch. Genau dort lohnt sich ab und zu ein kritischer Blick."
          },
          {
            type: "reflect",
            id: "budget-streichen",
            prompt: "Welche eine Ausgabe könntest du diesen Monat streichen, ohne sie zu vermissen?"
          }
        ]
      },
      {
        id: "werkzeuge-2",
        title: "Der Notgroschen",
        minutes: 4,
        steps: [
          {
            type: "text",
            title: "Dein finanzielles Sicherheitsnetz",
            body: "<p>Die Waschmaschine geht kaputt, das Auto muss in die Werkstatt, der Job fällt weg. Ein Notgroschen fängt das auf, ohne dass du teure Kredite brauchst. Der Dispokredit kostet oft über 10 % Zinsen.</p>",
            tip: "<strong>Faustregel:</strong> 3 bis 6 Monatsausgaben zurücklegen, bevor du anfängst zu investieren."
          },
          {
            type: "widget",
            widget: "emergency",
            title: "Wie groß sollte dein Notgroschen sein?",
            intro: "Trage deine monatlichen Ausgaben ein und schau, wie weit du schon bist."
          },
          {
            type: "text",
            title: "Wohin mit dem Notgroschen?",
            body: "<p>Auf ein <strong>Tagesgeldkonto</strong>: Du kommst jederzeit an das Geld und bekommst meist etwas Zinsen. In der EU sind Einlagen bis 100.000 € pro Person und Bank gesetzlich abgesichert.</p>"
          },
          {
            type: "quiz",
            q: "Wo ist der Notgroschen am besten aufgehoben?",
            options: ["Auf einem Tagesgeldkonto", "In einzelnen Aktien", "In einem Festgeld mit 5 Jahren Laufzeit"],
            correct: 0,
            explain: "Ein Notgroschen muss sofort verfügbar und stabil sein. Festgeld ist gebunden, Aktien schwanken."
          },
          {
            type: "quiz",
            q: "Warum gehört der Notgroschen nicht in Aktien?",
            options: [
              "Aktien sind grundsätzlich verboten für Privatleute",
              "Notfälle kommen oft genau dann, wenn die Kurse gerade gefallen sind",
              "Aktien bringen langfristig keine Rendite"
            ],
            correct: 1,
            explain: "Wirtschaftskrisen bringen oft beides gleichzeitig: Jobverlust und fallende Kurse. Dann müsstest du mit Verlust verkaufen."
          }
        ]
      },
      {
        id: "werkzeuge-3",
        title: "Nicht alles auf eine Karte: ETFs",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Was ist eine Aktie?",
            body: "<p>Mit einer Aktie kaufst du einen kleinen Anteil an einem Unternehmen. Läuft es gut, steigt meist der Wert, manchmal gibt es eine Gewinnbeteiligung (Dividende). Geht das Unternehmen pleite, kann die Aktie wertlos werden.</p>"
          },
          {
            type: "text",
            title: "ETF: ein ganzer Korb auf einmal",
            body: "<p>Ein <strong>ETF</strong> (börsengehandelter Indexfonds) kauft automatisch alle Aktien eines Index. Der MSCI World zum Beispiel enthält weit über 1.000 Unternehmen aus Industrieländern.</p>",
            points: [
              "<strong>Breit gestreut:</strong> Eine einzelne Pleite fällt kaum ins Gewicht.",
              "<strong>Günstig:</strong> Oft nur 0,1 bis 0,3 % Kosten pro Jahr.",
              "<strong>Sondervermögen:</strong> Geht der ETF-Anbieter pleite, gehört das Geld trotzdem den Anlegern."
            ]
          },
          {
            type: "widget",
            widget: "diversify",
            title: "Simulation: eine Aktie gegen viele",
            intro: "Wir lassen 60 Anleger je 10.000 € für 10 Jahre anlegen: die einen in eine einzige Aktie, die anderen gleich verteilt auf 50. Die Zahlen sind ausgedacht, das Muster ist echt."
          },
          {
            type: "quiz",
            q: "Eines von 1.000 Unternehmen in deinem ETF geht pleite. Was passiert?",
            options: ["Der ETF wird wertlos", "Du merkst es kaum", "Du musst Geld nachzahlen"],
            correct: 1,
            explain: "Ein Unternehmen macht nur einen winzigen Anteil des ETFs aus. Die anderen tragen weiter."
          },
          {
            type: "quiz",
            q: "Schützt breite Streuung vor jedem Verlust?",
            options: [
              "Ja, mit einem ETF kann man nichts verlieren",
              "Nein, bei einem allgemeinen Börsencrash fällt auch ein ETF",
              "Ja, solange man mehr als drei ETFs hat"
            ],
            correct: 1,
            explain: "Streuung senkt das Risiko einzelner Firmen, nicht das Risiko des ganzen Marktes. 2008 und 2020 fielen auch breite ETFs deutlich, haben sich danach aber erholt. Darum braucht es Zeit und Geduld."
          }
        ]
      }
    ]
  },
  {
    id: "steuern",
    title: "Steuern verstehen",
    short: "Steuern",
    icon: "percent",
    desc: "Wie die Einkommensteuer funktioniert, warum sich die Steuererklärung lohnt und was für Zinsen und Aktien gilt.",
    region: "Deutschland",
    disclaimer: "Allgemeine Informationen zum deutschen Steuerrecht nach Stand 2026, keine Steuerberatung. Beträge und Regeln ändern sich regelmäßig.",
    lessons: [
      {
        id: "steuern-1",
        title: "Wie die Einkommensteuer funktioniert",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Vom Brutto zum Netto",
            body: "<p>Von deinem Bruttogehalt gehen zwei Dinge ab, bevor es auf deinem Konto landet:</p>",
            points: [
              "<strong>Sozialabgaben:</strong> Renten-, Kranken-, Pflege- und Arbeitslosenversicherung. Dein Anteil liegt 2026 zusammen bei rund 21 % des Bruttos. Den gleichen Betrag ungefähr zahlt dein Arbeitgeber noch einmal obendrauf.",
              "<strong>Lohnsteuer:</strong> eine Vorauszahlung auf deine Einkommensteuer. Dein Arbeitgeber überweist sie jeden Monat direkt ans Finanzamt."
            ],
            tip: "<strong>Kirchensteuer</strong> zahlst du nur als Mitglied einer Kirche: 8 % (Bayern, Baden-Württemberg) oder 9 % deiner Einkommensteuer."
          },
          {
            type: "text",
            title: "Der Grundfreibetrag",
            body: "<p>Ein Teil deines Einkommens bleibt immer steuerfrei, damit das Existenzminimum gesichert ist. 2026 sind das:</p><p class=\"big-fact\">12.348 € im Jahr</p><p>Besteuert wird das <strong>zu versteuernde Einkommen</strong>. Das ist dein Einkommen nach Abzug von Werbungskosten, einem Teil der Sozialabgaben und weiteren Posten. Es liegt deshalb deutlich unter deinem Brutto.</p>"
          },
          {
            type: "widget",
            widget: "incomeTax",
            title: "Der Steuertarif zum Ausprobieren",
            intro: "Bewege den Regler. Die eine Linie zeigt, wie viel Steuer auf den nächsten Euro fällt, die andere, wie viel du im Schnitt zahlst."
          },
          {
            type: "text",
            title: "Zwei Steuersätze, die man oft verwechselt",
            body: "<p>Der deutsche Tarif steigt stufenlos an. Deshalb gibt es zwei Steuersätze:</p>",
            points: [
              "<strong>Grenzsteuersatz:</strong> So viel Steuer zahlst du auf den nächsten verdienten Euro. Er steigt von 14 % bis 42 %, ab 277.826 € sind es 45 %.",
              "<strong>Durchschnittssteuersatz:</strong> So viel Prozent deines gesamten zu versteuernden Einkommens gehen an Steuer. Er liegt immer darunter."
            ],
            tip: "<strong>Darum lohnt sich eine Gehaltserhöhung immer.</strong> Der höhere Satz gilt nur für den zusätzlichen Teil, nicht für dein ganzes Einkommen."
          },
          {
            type: "quiz",
            q: "Nach einer Gehaltserhöhung steigt Mias Grenzsteuersatz. Was passiert mit ihrem Netto?",
            options: [
              "Sie hat am Ende weniger Netto als vorher",
              "Nur auf den zusätzlichen Teil fällt der höhere Satz an, sie hat also mehr Netto",
              "Ihr ganzes Gehalt wird jetzt mit 42 % besteuert"
            ],
            correct: 1,
            explain: "Mehr Brutto bedeutet bei der Einkommensteuer immer mehr Netto. Dass man durch eine Erhöhung weniger hat, ist ein verbreiteter Irrtum."
          },
          {
            type: "quiz",
            q: "Was ist die Lohnsteuer?",
            options: [
              "Eine zusätzliche Steuer neben der Einkommensteuer",
              "Eine Vorauszahlung auf deine Einkommensteuer, die der Arbeitgeber abführt",
              "Eine Abgabe, die nur Arbeitgeber zahlen"
            ],
            correct: 1,
            explain: "Mit der Steuererklärung wird abgerechnet. War die Vorauszahlung zu hoch, bekommst du Geld zurück."
          }
        ]
      },
      {
        id: "steuern-2",
        title: "Die Steuererklärung lohnt sich",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Warum Geld zurückkommt",
            body: "<p>Die Lohnsteuer wird jeden Monat pauschal berechnet. Was du für deinen Job ausgegeben hast, weiß das Finanzamt nicht. Das kannst du erst mit der Steuererklärung geltend machen.</p>",
            points: [
              "Viele Arbeitnehmerinnen und Arbeitnehmer bekommen Geld zurück, oft mehrere hundert Euro.",
              "Bist du nicht zur Abgabe verpflichtet, kannst du die Erklärung bis zu vier Jahre rückwirkend freiwillig abgeben.",
              "Abgeben kannst du kostenlos über <strong>ELSTER</strong>, das Online-Portal der Finanzverwaltung. Es gibt auch günstige Steuer-Apps."
            ],
            tip: "<strong>Pflicht</strong> ist die Erklärung zum Beispiel mit der Steuerklassen-Kombination III/V, bei Nebeneinkünften über 410 € im Jahr oder bei Lohnersatzleistungen wie Elterngeld über 410 €. Abgabefrist ist dann in der Regel der 31. Juli des Folgejahres."
          },
          {
            type: "text",
            title: "Werbungskosten",
            body: "<p>Was du für deinen Job ausgibst, sind Werbungskosten. Das Finanzamt rechnet automatisch mit <strong>1.230 € pro Jahr</strong> (Arbeitnehmer-Pauschbetrag). Nur was darüber liegt, bringt dir zusätzlich Geld.</p>",
            points: [
              "<strong>Fahrtkosten:</strong> 0,38 € pro Kilometer der einfachen Strecke und Arbeitstag. Seit 2026 gilt das ab dem ersten Kilometer.",
              "<strong>Homeoffice:</strong> 6 € pro Tag, höchstens 1.260 € im Jahr.",
              "<strong>Arbeitsmittel:</strong> Laptop, Fachbücher, Arbeitskleidung.",
              "<strong>Weiteres:</strong> Fortbildungen, Bewerbungskosten, ein beruflich bedingter Umzug."
            ]
          },
          {
            type: "widget",
            widget: "werbungskosten",
            title: "Lohnt sich deine Steuererklärung?",
            intro: "Trag grob ein, was bei dir anfällt. Die vorausgefüllten Zahlen sind ein Beispiel."
          },
          {
            type: "quiz",
            q: "Lea fährt 20 km zur Arbeit, an 200 Tagen im Jahr. Wie hoch ist ihre Entfernungspauschale?",
            options: ["760 €", "1.520 €", "3.040 €"],
            correct: 1,
            explain: "20 km × 0,38 € × 200 Tage = 1.520 €. Gezählt wird nur die einfache Strecke, nicht Hin- und Rückweg."
          },
          {
            type: "reflect",
            id: "steuer-belege",
            prompt: "Welche Kosten hattest du dieses Jahr für deinen Job? Notiere sie jetzt, dann hast du sie bei der Steuererklärung parat.",
            placeholder: "Fahrtkosten, Laptop, Fachbuch, Fortbildung …"
          }
        ]
      },
      {
        id: "steuern-3",
        title: "Steuern auf Zinsen und Aktien",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Die Abgeltungsteuer",
            body: "<p>Auf Zinsen, Dividenden und Kursgewinne fällt eine pauschale Steuer an: 25 % plus Solidaritätszuschlag, zusammen <strong>26,375 %</strong>. Wer Kirchensteuer zahlt, zahlt etwas mehr.</p><p>Deine Bank zieht die Steuer automatisch ab und überweist sie ans Finanzamt.</p>"
          },
          {
            type: "text",
            title: "Der Sparerpauschbetrag",
            body: "<p>Ein Teil deiner Kapitalerträge bleibt jedes Jahr steuerfrei:</p><p class=\"big-fact\">1.000 € pro Jahr</p><p>Für Ehepaare sind es 2.000 €. Damit deine Bank das berücksichtigt, brauchst du einen <strong>Freistellungsauftrag</strong>. Den richtest du im Onlinebanking in wenigen Minuten ein.</p>",
            tip: "<strong>Mehrere Banken?</strong> Du kannst die 1.000 € aufteilen. Insgesamt gibt es sie aber nur einmal."
          },
          {
            type: "widget",
            widget: "capitalTax",
            title: "Wie viel Steuer fällt an?",
            intro: "Stell deine Erträge ein und probiere aus, was der Freistellungsauftrag ausmacht."
          },
          {
            type: "text",
            title: "Besonderheiten bei Aktien-ETFs",
            body: "<p>Bei Fonds, die überwiegend in Aktien anlegen, sind <strong>30 % der Erträge steuerfrei</strong>. Das heißt Teilfreistellung. Der Grund: Die Unternehmen im Fonds haben bereits Steuern gezahlt.</p><p>Bei ETFs, die Erträge wieder anlegen (thesaurierend), fällt außerdem jedes Jahr eine kleine Vorabpauschale an. Auch sie wird mit dem Freistellungsauftrag verrechnet.</p>"
          },
          {
            type: "quiz",
            q: "Du bekommst 600 € Zinsen im Jahr und hast einen Freistellungsauftrag über 1.000 €. Wie viel Steuer zahlst du?",
            options: ["0 €", "158,25 €", "150 €"],
            correct: 0,
            explain: "600 € liegen unter dem Sparerpauschbetrag. Ohne Freistellungsauftrag hätte die Bank 158,25 € einbehalten. Die könntest du dir nur über die Steuererklärung zurückholen."
          },
          {
            type: "reflect",
            id: "freistellungsauftrag",
            prompt: "Hast du bei deinen Banken einen Freistellungsauftrag eingerichtet? Wenn nicht: Wann erledigst du das?"
          }
        ]
      }
    ]
  },
  {
    id: "vorsorge",
    title: "Absicherung & Altersvorsorge",
    short: "Vorsorge",
    icon: "shield",
    desc: "Welche Versicherungen du wirklich brauchst und wie du für das Alter vorsorgst.",
    region: "Deutschland",
    disclaimer: "Allgemeine Finanzbildung zum deutschen System nach Stand 2026, keine Versicherungs-, Renten- oder Anlageberatung.",
    lessons: [
      {
        id: "vorsorge-1",
        title: "Welche Versicherungen wichtig sind",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Die Grundregel",
            body: "<p><strong>Versichere, was dich finanziell ruinieren könnte.</strong> Kleine Schäden zahlst du besser selbst aus deinem Notgroschen.</p>",
            points: [
              "<strong>Existenzbedrohend:</strong> Du verletzt jemanden schwer, oder du kannst wegen Krankheit nicht mehr arbeiten.",
              "<strong>Ärgerlich, aber verkraftbar:</strong> Das Handy fällt runter, der Koffer geht verloren."
            ],
            tip: "<strong>Gut zu wissen:</strong> Für die Kundschaft als Ganzes sind Versicherungen ein Verlustgeschäft, sonst könnten die Versicherer nicht wirtschaften. Darum lohnen sie sich nur für große Risiken."
          },
          {
            type: "text",
            title: "Die wichtigsten Versicherungen",
            body: "<p>Diese drei sind für fast alle Menschen wichtig:</p>",
            points: [
              "<strong>Private Haftpflicht:</strong> Zahlt, wenn du anderen einen Schaden zufügst. Ohne sie haftest du unbegrenzt, im schlimmsten Fall ein Leben lang. Sie kostet oft weniger als 100 € im Jahr. Achte auf eine Deckungssumme von mindestens 10 Millionen €.",
              "<strong>Krankenversicherung:</strong> In Deutschland Pflicht.",
              "<strong>Berufsunfähigkeit:</strong> Ersetzt einen Teil deines Einkommens, wenn du aus gesundheitlichen Gründen nicht mehr arbeiten kannst. Häufigste Ursache sind psychische Erkrankungen. Am günstigsten ist sie, wenn du jung und gesund abschließt."
            ],
            tip: "<strong>Unabhängige Beratung</strong> bieten die Verbraucherzentralen gegen eine kleine Gebühr an. Sie verkaufen keine Verträge."
          },
          {
            type: "widget",
            widget: "insuranceCheck",
            title: "Dein Versicherungs-Check",
            intro: "Wähle deine Lebenslage und tippe an, welche Versicherungen du schon hast."
          },
          {
            type: "quiz",
            q: "Welche Versicherung sollte praktisch jeder haben?",
            options: ["Handyversicherung", "Private Haftpflicht", "Reisegepäckversicherung"],
            correct: 1,
            explain: "Ein Haftpflichtschaden kann Millionen kosten, etwa wenn ein Mensch verletzt wird. Die Versicherung kostet dagegen nur wenige Euro im Monat."
          },
          {
            type: "quiz",
            q: "Warum ist eine Handyversicherung meist unnötig?",
            options: [
              "Handys gehen nie kaputt",
              "Den Schaden kannst du selbst tragen, und die Beiträge sind im Verhältnis hoch",
              "Sie ist in Deutschland verboten"
            ],
            correct: 1,
            explain: "Über die Jahre zahlst du oft mehr Beiträge, als ein neues Handy kostet. Dazu kommen viele Ausschlüsse im Kleingedruckten."
          },
          {
            type: "reflect",
            id: "versicherung-plan",
            prompt: "Welche Versicherung willst du prüfen, kündigen oder neu abschließen?"
          }
        ]
      },
      {
        id: "vorsorge-2",
        title: "Die drei Säulen der Altersvorsorge",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "So funktioniert die gesetzliche Rente",
            body: "<p>Die gesetzliche Rente ist ein <strong>Umlageverfahren</strong>: Die Beiträge der Berufstätigen von heute zahlen die Renten von heute. Für dich wird also nichts angespart.</p>",
            points: [
              "Heute kommen auf einen Rentner knapp zwei Beitragszahler. In den 1960er-Jahren waren es rund sechs.",
              "Ein Durchschnittsverdiener mit 45 Beitragsjahren bekommt rund 48 % des durchschnittlichen Lohns, beides vor Steuern gerechnet. Das reicht meist nicht, um den Lebensstandard zu halten.",
              "Die reguläre Altersgrenze steigt schrittweise auf 67 Jahre."
            ]
          },
          {
            type: "text",
            title: "Die drei Säulen",
            body: "<p>Altersvorsorge steht in Deutschland auf drei Säulen:</p>",
            points: [
              "<strong>Gesetzliche Rente:</strong> Pflicht für Angestellte. Beamte und viele Selbstständige haben eigene Systeme.",
              "<strong>Betriebliche Altersvorsorge:</strong> Ein Teil deines Gehalts fließt in einen Vertrag über deinen Arbeitgeber. Wandelst du Gehalt um, muss er in der Regel mindestens 15 % dazugeben.",
              "<strong>Private Vorsorge:</strong> zum Beispiel ein ETF-Sparplan, eine eigene Immobilie oder staatlich geförderte Verträge."
            ],
            tip: "<strong>Neu ab 2027:</strong> Das staatlich geförderte Altersvorsorgedepot löst die Riester-Rente für neue Verträge ab. Neue Riester-Verträge gibt es nur noch bis Ende 2026. Informiere dich vor einem Abschluss über die Details, zum Beispiel bei der Verbraucherzentrale."
          },
          {
            type: "text",
            title: "Deine Renteninformation",
            body: "<p>Ab 27 Jahren und nach fünf Beitragsjahren schickt dir die Deutsche Rentenversicherung jedes Jahr eine <strong>Renteninformation</strong>. Darin steht, mit wie viel Rente du rechnen kannst.</p><p>In der <strong>Digitalen Rentenübersicht</strong> siehst du online zusätzlich viele Betriebsrenten und private Verträge auf einen Blick.</p>"
          },
          {
            type: "quiz",
            q: "Wie funktioniert die gesetzliche Rente?",
            options: [
              "Jeder spart auf ein eigenes Konto",
              "Die heutigen Beitragszahler finanzieren die heutigen Renten",
              "Der Staat legt alle Beiträge in Aktien an"
            ],
            correct: 1,
            explain: "Das heißt Umlageverfahren. Weil es immer mehr Rentner und weniger Beitragszahler gibt, gerät das System unter Druck."
          },
          {
            type: "quiz",
            q: "Du wandelst 100 € deines Bruttogehalts in eine Betriebsrente um. Was muss dein Arbeitgeber in der Regel tun?",
            options: ["Nichts", "Mindestens 15 € dazugeben", "Die vollen 100 € übernehmen"],
            correct: 1,
            explain: "Der Arbeitgeber spart durch die Umwandlung Sozialabgaben. Deshalb muss er mindestens 15 % zuschießen, soweit er tatsächlich spart. Viele zahlen mehr. Frag nach!"
          }
        ]
      },
      {
        id: "vorsorge-3",
        title: "Deine Rentenlücke berechnen",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Was ist die Rentenlücke?",
            body: "<p>Die Rentenlücke ist der Unterschied zwischen dem, was du im Alter brauchst, und dem, was die gesetzliche Rente zahlt.</p><p>Als Faustregel brauchen viele Menschen im Alter etwa <strong>70 bis 80 % ihres letzten Nettoeinkommens</strong>. Manche Kosten fallen weg, etwa für den Arbeitsweg, andere kommen dazu, zum Beispiel für Gesundheit.</p>"
          },
          {
            type: "widget",
            widget: "pensionGap",
            title: "Rentenlücken-Rechner",
            intro: "Nimm die Zahl aus deiner Renteninformation, falls du eine hast. Sonst lass das Beispiel stehen."
          },
          {
            type: "text",
            title: "Was du jetzt tun kannst",
            body: "<p>Eine Lücke ist normal. Wichtig ist, dass du sie kennst und rechtzeitig anfängst:</p>",
            points: [
              "<strong>Früh starten:</strong> Durch den Zinseszins macht jedes Jahr einen großen Unterschied.",
              "<strong>Betriebsrente prüfen:</strong> vor allem, wenn dein Arbeitgeber mehr als die Pflicht dazugibt.",
              "<strong>Breit gestreut anlegen:</strong> Ein ETF-Sparplan passt gut, wenn du viele Jahre Zeit hast.",
              "<strong>Mitwachsen lassen:</strong> Erhöhe die Sparrate bei jeder Gehaltserhöhung."
            ]
          },
          {
            type: "quiz",
            q: "Warum rechnet der Rechner mit einer Rendite nach Inflation?",
            options: [
              "Damit alle Beträge in heutiger Kaufkraft vergleichbar sind",
              "Weil es in Zukunft keine Inflation mehr gibt",
              "Weil Renten nie steigen"
            ],
            correct: 0,
            explain: "1.000 € in 30 Jahren sind weniger wert als heute. Wer mit Rendite nach Inflation rechnet, kann alles in heutigen Euro vergleichen."
          },
          {
            type: "reflect",
            id: "rente-schritt",
            prompt: "Was ist dein erster Schritt für deine Altersvorsorge?",
            placeholder: "Renteninformation suchen, beim Arbeitgeber nach Betriebsrente fragen …"
          }
        ]
      }
    ]
  },
  {
    id: "staerken",
    title: "Deine Stärken",
    short: "Stärken",
    icon: "spark",
    desc: "Finde heraus, was dir liegt, und welche Möglichkeiten daraus entstehen.",
    lessons: [
      {
        id: "staerken-1",
        title: "Was ist eine Stärke?",
        minutes: 4,
        steps: [
          {
            type: "text",
            title: "Talent mal Übung",
            body: "<p>Ein <strong>Talent</strong> ist ein natürliches Muster, wie du denkst, fühlst oder handelst. Eine <strong>Stärke</strong> entsteht, wenn du in dieses Talent Zeit und Übung steckst.</p><p class=\"big-fact\">Talent × Übung = Stärke</p><p>Darum sind Stärken nicht fest verteilt. Du kannst sie entwickeln.</p>"
          },
          {
            type: "text",
            title: "Der Energie-Test",
            body: "<p>Stärken erkennst du weniger an dem, was du kannst, als an dem, was dich lebendig macht. Achte auf diese Zeichen:</p>",
            points: [
              "Du vergisst dabei die Zeit.",
              "Du lernst es auffallend schnell.",
              "Danach fühlst du dich wacher statt erschöpft.",
              "Andere fragen dich immer wieder genau dafür um Hilfe."
            ]
          },
          {
            type: "quiz",
            q: "Woran erkennst du eine echte Stärke am ehesten?",
            options: [
              "Du kannst es, auch wenn es dich jedes Mal auslaugt",
              "Es gibt dir Energie und du wirst schnell besser",
              "Deine Eltern haben es dir geraten"
            ],
            correct: 1,
            explain: "Etwas gut zu können, das dich auslaugt, ist eher eine erlernte Fähigkeit. Stärken geben Energie zurück."
          },
          {
            type: "text",
            title: "Stärken ausbauen statt nur Schwächen reparieren",
            body: "<p>Viele verbringen ihr Leben damit, Schwächen auszubügeln. Mehr Wachstum entsteht oft, wenn du Stärken gezielt ausbaust und Schwächen nur auf <em>gut genug</em> bringst.</p>"
          },
          {
            type: "reflect",
            id: "staerken-momente",
            prompt: "Nenne drei Momente, in denen du richtig in deinem Element warst. Was hast du da gemacht?",
            placeholder: "1. …\n2. …\n3. …"
          }
        ]
      },
      {
        id: "staerken-2",
        title: "Dein Stärken-Check",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Ein ehrlicher Blick auf dich",
            body: "<p>Gleich bewertest du 12 Aussagen. Antworte spontan und so, wie du <em>bist</em>, nicht wie du gern wärst.</p><p class=\"muted small\">Das ist eine Reflexionshilfe, kein wissenschaftlicher Test. Dein Ergebnis bleibt auf deinem Gerät.</p>"
          },
          {
            type: "widget",
            widget: "strengths",
            title: "Stärken-Check",
            intro: "1 = trifft gar nicht zu, 5 = trifft voll zu. Dein Profil baut sich live auf."
          },
          {
            type: "reflect",
            id: "staerken-ergebnis",
            prompt: "Überrascht dich dein Ergebnis? Was passt, was eher nicht?"
          }
        ]
      },
      {
        id: "staerken-3",
        title: "Aus Stärken werden Möglichkeiten",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Stärke trifft Problem",
            body: "<p>Wert entsteht dort, wo deine Stärke ein Problem anderer Menschen löst. Das gilt für Jobs, Nebenprojekte und Ehrenämter gleichermaßen.</p><p class=\"big-fact\">Stärke + Problem = Chance</p>"
          },
          {
            type: "widget",
            widget: "opportunities",
            title: "Möglichkeiten für dich",
            intro: "Basierend auf deinem Stärken-Check. Du kannst die Auswahl auch selbst ändern."
          },
          {
            type: "text",
            title: "Klein testen statt groß grübeln",
            body: "<p>Du musst nicht morgen kündigen. Starte ein <strong>Mini-Experiment</strong>:</p>",
            points: [
              "Ein Wochenendprojekt umsetzen",
              "Jemanden auf einen Kaffee treffen, der das beruflich macht",
              "Ein kurzer Online-Kurs",
              "Für Freunde oder einen Verein etwas ehrenamtlich übernehmen"
            ]
          },
          {
            type: "quiz",
            q: "Was ist der klügste erste Schritt, wenn dich eine neue Richtung reizt?",
            options: [
              "Sofort alles auf eine Karte setzen",
              "Ein kleines Experiment starten und Rückmeldung einholen",
              "Warten, bis du dir hundertprozentig sicher bist"
            ],
            correct: 1,
            explain: "Kleine Experimente kosten wenig und liefern echte Erfahrung. Gewissheit entsteht durch Ausprobieren, nicht durch Nachdenken."
          },
          {
            type: "reflect",
            id: "staerken-experiment",
            prompt: "Welches Mini-Experiment startest du in den nächsten 14 Tagen?"
          }
        ]
      }
    ]
  },
  {
    id: "verhandeln",
    title: "Verhandeln",
    short: "Verhandeln",
    icon: "chat",
    desc: "Mehr Gehalt, bessere Preise, faire Lösungen. Verhandeln kann man lernen.",
    lessons: [
      {
        id: "verhandeln-1",
        title: "Die Grundlagen guter Verhandlungen",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Verhandeln ist kein Kampf",
            body: "<p>Das bekannteste Modell stammt von der Harvard-Universität (Roger Fisher und William Ury, 1981). Die Idee: Gute Verhandlungen suchen eine Lösung, mit der beide Seiten leben können.</p>",
            points: [
              "<strong>Menschen und Probleme trennen:</strong> hart in der Sache, freundlich zur Person.",
              "<strong>Interessen statt Positionen:</strong> Frag, warum jemand etwas will.",
              "<strong>Optionen entwickeln:</strong> Sammelt mehrere Lösungen, bevor ihr entscheidet.",
              "<strong>Faire Kriterien nutzen:</strong> Marktpreise, Tarifverträge, Vergleichsangebote."
            ]
          },
          {
            type: "text",
            title: "Position oder Interesse?",
            body: "<p>Eine <strong>Position</strong> ist das, was jemand fordert. Das <strong>Interesse</strong> ist der Grund dahinter. Wer die Interessen kennt, findet oft Lösungen, an die vorher niemand gedacht hat.</p>",
            tip: "<strong>Beispiel:</strong> Zwei streiten um eine Orange. Die eine braucht den Saft, die andere die Schale zum Backen. Wer die Orange einfach halbiert, verschenkt die Hälfte."
          },
          {
            type: "widget",
            widget: "interestsSort",
            title: "Erkennst du den Unterschied?",
            intro: "Ist die Aussage eine Position oder ein Interesse?"
          },
          {
            type: "text",
            title: "Deine beste Alternative",
            body: "<p>Vor jeder Verhandlung solltest du wissen, was du tust, wenn ihr euch nicht einigt. Im Harvard-Modell heißt das <strong>BATNA</strong>: die beste Alternative zur verhandelten Einigung.</p><p>Je besser deine Alternative, desto ruhiger verhandelst du. Wer ein zweites Jobangebot hat, muss nicht alles annehmen.</p>"
          },
          {
            type: "quiz",
            q: "Was ist deine BATNA?",
            options: ["Dein Wunschergebnis", "Das, was du tust, wenn ihr euch nicht einigt", "Dein erstes Angebot"],
            correct: 1,
            explain: "Die BATNA ist dein Plan B. Sie zeigt dir, ab wann ein Angebot schlechter ist als deine Alternative."
          }
        ]
      },
      {
        id: "verhandeln-2",
        title: "Die Gehaltsverhandlung",
        minutes: 7,
        steps: [
          {
            type: "text",
            title: "Vorbereitung ist alles",
            body: "<p>Die meisten Gehaltsgespräche werden vorher entschieden, nicht im Raum.</p>",
            points: [
              "<strong>Marktwert kennen:</strong> Der Entgeltatlas der Bundesagentur für Arbeit, Gehaltsreports und Tarifverträge zeigen, was in deinem Beruf üblich ist.",
              "<strong>Erfolge sammeln:</strong> Was hast du erreicht, verbessert, übernommen? Mit Zahlen, wo es geht.",
              "<strong>Zeitpunkt wählen:</strong> nach einem Erfolg, im Jahresgespräch oder wenn du neue Aufgaben übernimmst.",
              "<strong>Untergrenze festlegen:</strong> Ab welchem Betrag sagst du Nein oder schaust dich um?"
            ]
          },
          {
            type: "widget",
            widget: "salaryPlan",
            title: "Deine Verhandlungskarte",
            intro: "Trag deine Zahlen ein. Die vorausgefüllten Werte sind ein Beispiel. Alles bleibt in deinem Kompass gespeichert."
          },
          {
            type: "text",
            title: "Der Ankereffekt",
            body: "<p>Die erste Zahl im Raum prägt das ganze Gespräch. Psychologen nennen das <strong>Ankereffekt</strong>. Nenne deshalb selbst zuerst eine Zahl, etwas über deinem Ziel, aber gut begründbar.</p>",
            points: [
              "Eine genaue Zahl wie 52.500 € wirkt durchdachter als eine runde.",
              "Begründe mit dem Markt und deinen Erfolgen, nicht mit privaten Ausgaben.",
              "Nach deiner Zahl: schweigen und zuhören.",
              "Geht beim Geld nichts, verhandle über anderes: Weiterbildung, Homeoffice, Urlaubstage, Jobticket."
            ]
          },
          {
            type: "quiz",
            q: "Wie begründest du deine Gehaltsforderung am besten?",
            options: [
              "Meine Miete ist gestiegen",
              "Mit dem Marktwert und meinen Erfolgen im Job",
              "Mein Kollege verdient mehr"
            ],
            correct: 1,
            explain: "Private Ausgaben sind nicht das Thema deines Arbeitgebers. Was zählt, ist dein Wert für das Unternehmen."
          },
          {
            type: "quiz",
            q: "Deine Chefin sagt: „Mehr Geld geht dieses Jahr nicht.“ Was ist eine gute Reaktion?",
            options: [
              "Sofort kündigen",
              "Über andere Leistungen sprechen und einen festen Termin für ein neues Gespräch vereinbaren",
              "Das Thema nie wieder ansprechen"
            ],
            correct: 1,
            explain: "Ein Nein heute ist oft ein „noch nicht“. Mit einem festen Termin und klaren Zielen bis dahin hast du beim nächsten Mal gute Karten."
          },
          {
            type: "reflect",
            id: "gehalt-erfolge",
            prompt: "Welche drei Erfolge aus dem letzten Jahr kannst du in einem Gehaltsgespräch nennen?",
            placeholder: "1. …\n2. …\n3. …"
          }
        ]
      },
      {
        id: "verhandeln-3",
        title: "Verhandeln im Alltag",
        minutes: 4,
        steps: [
          {
            type: "text",
            title: "Mehr ist verhandelbar, als du denkst",
            body: "<p>Nicht nur beim Gehalt lohnt es sich zu fragen:</p>",
            points: [
              "<strong>Handy- und Internetverträge:</strong> Mit einem Vergleichsangebot beim Anbieter anrufen.",
              "<strong>Größere Anschaffungen:</strong> Möbel, Elektronik, Autos. Frag nach Ausstellungsstücken oder einem Rabatt.",
              "<strong>Handwerker:</strong> Mehrere Angebote einholen und vergleichen.",
              "<strong>Bank:</strong> Kontogebühren und Dispozinsen ansprechen."
            ]
          },
          {
            type: "text",
            title: "Drei Sätze, die helfen",
            body: "<p>Freundlich gefragt, kostet ein Versuch nichts:</p>",
            points: [
              "„Ist das Ihr bester Preis?“",
              "„Was können Sie mir anbieten, damit ich heute zusage?“",
              "„Ich habe ein Angebot über … Können Sie da mitgehen?“"
            ],
            tip: "<strong>Freundlich bleiben zahlt sich aus.</strong> Menschen kommen eher jemandem entgegen, den sie sympathisch finden."
          },
          {
            type: "quiz",
            q: "Was bringt dir ein Vergleichsangebot in einer Verhandlung?",
            options: [
              "Nichts, Anbieter ignorieren so etwas",
              "Eine echte Alternative und ein faires Vergleichskriterium",
              "Nur Ärger mit dem Anbieter"
            ],
            correct: 1,
            explain: "Ein Vergleichsangebot ist deine BATNA und ein objektiver Maßstab zugleich. Beides stärkt deine Position."
          },
          {
            type: "reflect",
            id: "verhandeln-alltag",
            prompt: "Was verhandelst du als Nächstes? Einen Vertrag, einen Preis, eine Aufgabe?"
          }
        ]
      }
    ]
  },
  {
    id: "entwicklung",
    title: "Selbstverwirklichung & Entwicklung",
    short: "Entwicklung",
    icon: "mountain",
    desc: "Bedürfnisse, Sinn, Ziele und Gewohnheiten, die dich weiterbringen.",
    lessons: [
      {
        id: "entwicklung-1",
        title: "Was Menschen antreibt",
        minutes: 4,
        steps: [
          {
            type: "text",
            title: "Die Bedürfnispyramide",
            body: "<p>Der Psychologe Abraham Maslow beschrieb 1943, dass Menschen verschiedene Bedürfnisse haben. Grob gilt: Erst wenn die unteren erfüllt sind, rücken die oberen in den Fokus.</p>"
          },
          {
            type: "widget",
            widget: "maslow",
            title: "Erkunde die Stufen",
            intro: "Tippe auf eine Stufe."
          },
          {
            type: "text",
            title: "Ein Modell, keine Treppe",
            body: "<p>Heute weiß man: Menschen springen zwischen den Stufen, und Kulturen gewichten sie unterschiedlich. Als Spiegel ist das Modell trotzdem hilfreich. Wer ständig Geldsorgen hat, findet schwer Ruhe für Sinnfragen. Darum gehören Finanzen und persönliche Entwicklung zusammen.</p>"
          },
          {
            type: "quiz",
            q: "Zu welcher Stufe gehören Freundschaft und Zugehörigkeit?",
            options: ["Sicherheit", "Soziale Bedürfnisse", "Selbstverwirklichung"],
            correct: 1,
            explain: "Freundschaft, Liebe und Zugehörigkeit bilden die mittlere Stufe der sozialen Bedürfnisse."
          },
          {
            type: "reflect",
            id: "maslow-stufe",
            prompt: "Auf welcher Stufe steckst du gerade die meiste Energie? Und welche kommt zu kurz?"
          }
        ]
      },
      {
        id: "entwicklung-2",
        title: "Dein Lebensrad",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Eine Momentaufnahme deines Lebens",
            body: "<p>Das Lebensrad ist ein Werkzeug aus dem Coaching. Du bewertest acht Lebensbereiche von 1 bis 10. Wie rund läuft dein Rad gerade?</p><p class=\"muted small\">Es gibt kein richtig oder falsch. Es geht um dein Gefühl heute.</p>"
          },
          {
            type: "widget",
            widget: "lifewheel",
            title: "Lebensrad",
            intro: "Bewege die Regler. Dein Rad wird gespeichert und erscheint in deinem Kompass."
          },
          {
            type: "reflect",
            id: "lebensrad-hebel",
            prompt: "Welcher Bereich würde, um 2 Punkte verbessert, auch die anderen mitziehen? Was wäre ein erster Schritt?"
          }
        ]
      },
      {
        id: "entwicklung-3",
        title: "Ikigai: Wofür du aufstehst",
        minutes: 6,
        steps: [
          {
            type: "text",
            title: "Vier Fragen, ein Schnittpunkt",
            body: "<p><em>Ikigai</em> ist japanisch und bedeutet ungefähr <em>das, wofür es sich zu leben lohnt</em>. Im Westen wird es oft als Diagramm aus vier Kreisen gezeigt:</p>",
            points: [
              "Was liebst du?",
              "Worin bist du gut?",
              "Was braucht die Welt?",
              "Wofür kannst du bezahlt werden?"
            ],
            tip: "<strong>Gut zu wissen:</strong> Das Vier-Kreise-Bild ist eine moderne westliche Darstellung. In Japan meint Ikigai oft auch kleine Freuden des Alltags."
          },
          {
            type: "widget",
            widget: "ikigai",
            title: "Dein Ikigai",
            intro: "Notiere zu jeder Frage Stichpunkte, getrennt durch Kommas. Achte darauf, was in mehreren Kreisen auftaucht."
          },
          {
            type: "quiz",
            q: "Was entsteht laut Diagramm aus „Was du liebst“ und „Worin du gut bist“?",
            options: ["Beruf", "Leidenschaft", "Mission"],
            correct: 1,
            explain: "Liebe + Können = Leidenschaft. Mission ist Liebe + was die Welt braucht, Beruf ist Können + Bezahlung."
          },
          {
            type: "reflect",
            id: "ikigai-muster",
            prompt: "Welches Stichwort taucht in mehr als einem Kreis auf? Was sagt dir das?"
          }
        ]
      },
      {
        id: "entwicklung-4",
        title: "Ziele, die du wirklich erreichst",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Die SMART-Formel",
            body: "<p>Vage Ziele wie „mehr Sport“ scheitern meistens. Gute Ziele sind:</p>",
            points: [
              "<strong>S</strong>pezifisch: Was genau?",
              "<strong>M</strong>essbar: Woran merkst du, dass du es geschafft hast?",
              "<strong>A</strong>ttraktiv: Warum willst du das wirklich?",
              "<strong>R</strong>ealistisch: Ist es mit deinen Mitteln machbar?",
              "<strong>T</strong>erminiert: Bis wann?"
            ]
          },
          {
            type: "widget",
            widget: "smart",
            title: "Baue dein Ziel",
            intro: "Fülle die Felder aus. Dein Ziel wird in deinem Kompass gespeichert."
          },
          {
            type: "text",
            title: "Der Wenn-dann-Plan",
            body: "<p>Die Forschung des Psychologen Peter Gollwitzer zeigt: Wer vorher festlegt, <em>wann und wo</em> er handelt, setzt Ziele deutlich häufiger um.</p><p class=\"tip\"><strong>Beispiel:</strong> Wenn ich montags nach der Arbeit nach Hause komme, ziehe ich sofort die Laufschuhe an.</p>"
          },
          {
            type: "quiz",
            q: "Welches Ziel ist SMART?",
            options: [
              "Ich will gesünder leben.",
              "Ich will bis 31. März 1.500 € als Notgroschen sparen, mit 250 € pro Monat per Dauerauftrag.",
              "Ich will irgendwann reich sein."
            ],
            correct: 1,
            explain: "Spezifisch (Notgroschen), messbar (1.500 €), realistisch (250 € pro Monat) und terminiert (31. März)."
          }
        ]
      },
      {
        id: "entwicklung-5",
        title: "1 % besser, jeden Tag",
        minutes: 5,
        steps: [
          {
            type: "text",
            title: "Der Zinseszins der Gewohnheiten",
            body: "<p>Was beim Geld gilt, gilt auch für dich: Kleine Verbesserungen summieren sich. Jeden Tag 1 % besser ist kaum spürbar, nach einem Jahr ist es gewaltig.</p>"
          },
          {
            type: "widget",
            widget: "habits",
            title: "Kleine Schritte, großer Unterschied",
            intro: "Stell ein, um wie viel Prozent du dich täglich verbesserst oder verschlechterst."
          },
          {
            type: "text",
            title: "So bleiben Gewohnheiten hängen",
            body: "<p>Ideen aus der Gewohnheitsforschung, bekannt gemacht durch James Clear:</p>",
            points: [
              "<strong>Mach es klein:</strong> Die 2-Minuten-Regel. Eine Seite lesen statt ein Kapitel.",
              "<strong>Mach es sichtbar:</strong> Das Buch liegt aufs Kopfkissen, die Laufschuhe stehen an der Tür.",
              "<strong>Koppel es:</strong> „Nach dem Zähneputzen mache ich 5 Kniebeugen.“",
              "<strong>Nie zweimal auslassen:</strong> Ein verpasster Tag ist normal, zwei sind der Anfang einer neuen Gewohnheit."
            ]
          },
          {
            type: "quiz",
            q: "Wie viel stärker bist du nach einem Jahr, wenn du jeden Tag 1 % besser wirst (1,01³⁶⁵)?",
            options: ["Etwa 3,6-mal", "Etwa 37-mal", "Etwa 365-mal"],
            correct: 1,
            explain: "1,01³⁶⁵ ≈ 37,8. Umgekehrt: 0,99³⁶⁵ ≈ 0,03. Täglich 1 % schlechter lässt fast nichts übrig."
          },
          {
            type: "reflect",
            id: "gewohnheit-start",
            prompt: "Welche Mini-Gewohnheit unter 2 Minuten startest du morgen? Woran koppelst du sie?",
            placeholder: "Nach dem … mache ich …"
          }
        ]
      }
    ]
  }
];
