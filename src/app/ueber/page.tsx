import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Über 9min',
  description: 'Wer schreibt hier, mit welcher Methode, in welcher Tradition — und warum kein Name.',
}

export default function UeberPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 20px 100px' }}>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(28px, 5vw, 38px)',
          color: 'var(--color-tannengruen)',
          margin: '0 0 48px',
          letterSpacing: '-0.01em',
        }}>
          Wer schreibt hier, mit welcher Methode, in welcher Tradition — und warum kein Name.
        </h1>

        <div className="prose-9min">

          <h2>Wer schreibt hier?</h2>
          <p>
            9min ist eine Person, keine Organisation. Schweizer Bürger, Deutschschweiz, Jahrgang Ende 1980er,
            beruflicher Hintergrund in der IT. Kein Journalist von Beruf. Kein Berufspolitiker. Kein Funktionär
            einer NGO. Ein normaler Mensch mit einem Tagesjob, der in seiner Freizeit liest, beobachtet und schreibt.
          </p>
          <p>
            9min ist auch nicht der erste Versuch, eine andere Stimme in die Schweizer Medienlandschaft zu bringen.
            Aber 9min versucht etwas, das die etablierten Alternativen nicht versuchen: keine Parteilinie zu
            vertreten, keine Geldgeber zu bedienen, keine Karriere damit zu bauen. Nur eine Methode anzuwenden —
            und zu schauen, was dabei sichtbar wird.
          </p>

          <h2>Welche Richtung?</h2>
          <p>
            9min steht in einer intellektuellen Tradition, die in der Schweiz publizistisch unterversorgt ist:
            jener der Österreichischen Schule (Mises, Hayek) und ihrer Nachfolger (Friedman, Baader). Diese
            Tradition stellt Fragen, die andere nicht stellen — über Anreize statt Absichten, über Geld statt
            Politik, über Verluste statt nur Gewinne, über Adressierbarkeit statt strukturellen Nebel.
          </p>
          <p>
            9min folgt dieser Tradition nicht als Glaubenssatz, sondern als Werkzeug. Wenn ein anderes Werkzeug
            die Realität besser erklärt, wird es benutzt. Aber die Erfahrung der letzten Jahrzehnte zeigt: Die
            österreichischen Werkzeuge erklären die heutige Schweiz oft besser als die etablierten — gerade weil
            sie nicht etabliert sind.
          </p>
          <p>Konkret heisst das, dass 9min sich an bestimmten Grundüberzeugungen orientiert:</p>
          <ul>
            <li><strong>Macht muss adressierbar sein.</strong> Konkrete Menschen treffen konkrete Entscheidungen mit konkreten Folgen. Strukturkritik ohne Namen wird zu Nebel.</li>
            <li><strong>Anreize formen Verhalten, nicht Absichten.</strong> Wer eine Institution verstehen will, schaut auf ihre Anreize, nicht auf ihre Selbstbeschreibung.</li>
            <li><strong>Zentrale Planung produziert vorhersehbare Folgen.</strong> Knappheit, Fehlallokation, Korruption. Das gilt für Geld, für Märkte, für Information.</li>
            <li><strong>Verluste müssen real sein, damit Lernen möglich wird.</strong> Sozialisierte Verluste sind das Ende der Marktwirtschaft, nicht ihre Rettung.</li>
            <li><strong>Geld ist die Grundlage.</strong> Wer das Geldsystem nicht versteht, redet um den Kern der heutigen ökonomischen Probleme herum.</li>
            <li><strong>Wahrheit entsteht durch Reibung, nicht durch Konsens.</strong> Wenn alle dasselbe sagen, fehlt meistens etwas.</li>
            <li><strong>Freiheit ist Voraussetzung, nicht Resultat.</strong> Gesellschaftliche Probleme werden in Freiheit bearbeitet — nicht erst nach ihrer Lösung gewährt.</li>
            <li><strong>Die Schweiz hat Werkzeuge, die andere nicht haben.</strong> Föderalismus, direkte Demokratie, Milizsystem. Sie sind nicht zufällig entstanden. Sie sollten nicht achtlos verbraucht werden.</li>
          </ul>
          <p>Diese Grundüberzeugungen werden in den Texten nicht ständig wiederholt. Sie sind die Linse, durch die geschaut wird.</p>

          <h2>Welche Methode?</h2>
          <p>
            Methodisch folgt 9min einem schweizerischen Vorbild: Jean Rudolf von Salis, der von 1939 bis 1945
            die «Weltchronik» auf Radio Beromünster sprach. Seine Methode war einfach und revolutionär:
            beschreiben, nicht agitieren. Mehrere Blickwinkel liefern. Den Zuhörern zutrauen, selbst zu denken.
            Die Fakten und Verbindungen bereitstellen, aus denen freie Köpfe Schlüsse ziehen können.
          </p>
          <p>
            Das Nazi-Regime stufte Beromünster als «Feindsender» ein. Das war ein Ehrentitel, kein Vorwurf.
            Es war die präzise Beschreibung dessen, was eine ehrliche Stimme in einer Umgebung fabrizierten
            Konsenses ist: ein Feind der Macht, die diesen Konsens herstellt.
          </p>
          <p>
            9min versucht, in einer Zeit medialer Vereinnahmung etwas Ähnliches zu leisten — in unvergleichbar
            bescheidenerem Massstab, mit unvergleichbar weniger Bedeutung, aber in der gleichen Tradition.
            Beschreiben, nicht agitieren. Den Lesern zutrauen, selbst zu denken. Die Verbindungen herstellen,
            die der Konsens nicht herstellt. Die Fragen stellen, die der Konsens nicht stellt.
          </p>

          <h2>Was 9min macht</h2>
          <p>Drei Säulen, eine Methode:</p>
          <p>
            <strong>Medienkritik.</strong> Regelmässige Analyse der etablierten Schweizer Berichterstattung —
            insbesondere SRF —, mit Fokus auf strukturelle Auslassungen, fehlende Verknüpfungen, ungestellte
            Fragen. Nicht «links» oder «rechts» zählen, sondern: Wird beschrieben, was zu beschreiben wäre?
            Wird adressiert, wer adressierbar wäre? Wird nachgefasst, wenn Versprechen brechen?
          </p>
          <p>
            <strong>Essays.</strong> Längere Texte zu grundlegenden Themen — Geldordnung, Systemkritik,
            intellektuelle Genese der heutigen Verhältnisse, schweizerische Spezifika. Hier wird die Tradition
            explizit, hier werden die Werkzeuge benannt, hier werden Grundlagen gelegt, auf die die
            Medienkritik implizit verweist.
          </p>
          <p>
            <strong>Zeitzeugen.</strong> Lange Interviews mit alten Menschen, die das Land vor uns gelebt haben.
            Keine Politik-Talkrunden, keine Soundbites. Lebenserzählungen aus der Generation, die in den heutigen
            Medien nicht vorkommt — obwohl sie den meisten Kontext mitbringt. Eine Anwendung der Von-Salis-Methode
            auf eine vergessene Quelle.
          </p>

          <h2>Wer finanziert 9min?</h2>
          <p>
            Niemand. Kein Sponsor, kein Investor, keine Stiftung, keine Partei, keine NGO, keine ausländische
            Macht, kein Tech-Konzern, kein Milliardär. Die Arbeit entsteht in der Freizeit, aus dem privaten
            Bedürfnis, eine Perspektive sichtbar zu machen, die in den etablierten Medien fehlt.
          </p>
          <p>
            Wenn sich das eines Tages ändert — wenn 9min Einnahmen über Abonnements, Spenden oder Werbung
            generiert —, wird das hier transparent gemacht. Bis dahin gilt: Die einzige Investition ist Zeit.
            Die einzige Erwartung an die Leser ist, dass sie die Argumente prüfen, nicht ihnen glauben.
          </p>

          <h2>Warum kein Name?</h2>
          <p>
            Weil die Argumente zählen sollen, nicht die Biografie.
          </p>
          <p>
            Die Federalist Papers wurden 1787/88 unter dem Pseudonym «Publius» publiziert — von Alexander
            Hamilton, James Madison und John Jay. Sie waren politische Akteure mit Positionen, Gegnern und
            Karrieren. Sie wussten genau, dass ihre Argumente nur dann frei geprüft würden, wenn sie nicht
            durch die Person des Autors gefiltert würden. Erst nach der Ratifizierung der amerikanischen
            Verfassung wurde die Autorschaft enthüllt. Zu diesem Zeitpunkt waren die Texte bereits Klassiker —
            wegen der Argumente, nicht wegen der Namen.
          </p>
          <p>
            Dieses Prinzip gilt heute mehr denn je. Ein offener Name würde 9min in eine Schublade legen, in die
            es nicht gehört. Wer SVP schreit, sobald ein Argument gegen den Staatsausbau fällt; wer Neoliberalismus
            murmelt, sobald die Notenbankpolitik kritisiert wird; wer Schwurbler ruft, sobald die
            Konsens-Berichterstattung hinterfragt wird; wer den Text durch die Biografie statt durch den Inhalt
            liest — der versteht den Punkt nicht.
          </p>
          <p>
            Es geht nicht darum, dass die Person hinter 9min etwas zu verbergen hätte. Es geht darum, dass das,
            was geschrieben wird, unabhängig von der Person geprüft werden soll. Das ist die alte journalistische
            Tugend: Trenne den Boten von der Botschaft. Heute wird sie selten geübt — auch deshalb, weil die
            etablierten Medien sich zunehmend selbst zur Botschaft machen.
          </p>

          <h2>Und wenn die Identität doch bekannt wird?</h2>
          <p>
            Möglich, sogar wahrscheinlich irgendwann. Die Schweiz ist klein. Indizien lassen sich zusammenzählen.
            9min betreibt keine professionelle Anonymisierung — wer ernsthaft sucht, findet auch erste Spuren.
          </p>
          <p>
            Sollte der Tag kommen, an dem die Verbindung öffentlich gemacht wird, gilt: An den Inhalten ändert
            das nichts. In 9min steht kein Satz, hinter dem der Autor nicht auch mit Namen stünde. Anonymität
            ist hier nicht Schutz vor Verantwortung, sondern Schutz davor, dass die Biografie zwischen Leser
            und Argument tritt. Wer beim Erscheinen eines Namens aufhört, die Argumente zu prüfen, hat den
            Punkt nie verstanden. Wer dann erst recht prüft, weil ihm der Name nicht passt, ist immerhin
            konsistent — auch wenn er nichts gelernt hat.
          </p>
          <p>
            Eine allfällige Enthüllung wird hier kommentiert, nicht andernorts. Wer 9min ist, erfährt es am
            ehesten von 9min selbst — sobald der Zeitpunkt gekommen ist oder die Anonymität nicht mehr haltbar
            bleibt.
          </p>

          <h2>Was 9min nicht ist</h2>
          <ul>
            <li>9min ist kein Sprachrohr einer Partei. Auch nicht im Hintergrund.</li>
            <li>9min ist kein Projekt einer NGO oder Stiftung. Auch nicht indirekt.</li>
            <li>9min ist keine Plattform für Verschwörungstheorien. Wo Belege fehlen, wird gesagt, dass Belege fehlen. Wo Hypothesen aufgestellt werden, sind sie als solche markiert.</li>
            <li>9min ist kein Hassmedium. Keine Hetze gegen Personen, keine Schmähungen, keine Pauschalverurteilungen. Kritik richtet sich an Strukturen und Argumente, nicht an Identitäten.</li>
            <li>9min ist kein Sammelbecken für Bots, Kollektive oder Ghostwriter. Eine Person, eine Stimme, eine Methode.</li>
          </ul>

          <h2>Was 9min ist</h2>
          <p>
            Ein publizistisches Projekt aus einer wirtschaftsliberalen Schweizer Perspektive, das die etablierte
            Berichterstattung kritisch analysiert, eigene Essays zur Geldordnung und Systemfragen publiziert,
            und alten Menschen eine Stimme gibt.
          </p>
          <p>
            Eine Methode — empirische Disziplin, Trennung von Fakten und Narrativen, Adressierbarkeit von
            Verantwortung.
          </p>
          <p>
            Ein Angebot an Leser, die merken, dass etwas nicht stimmt, aber kein Vokabular dafür haben; an
            Leser, die ein Vokabular haben, aber wenig Material; an Leser, die einfach interessiert sind, wie
            eine andere Lesart der Schweizer Gegenwart aussehen könnte.
          </p>
          <p>
            Ein Versuch, in einer Medienlandschaft, in der die meisten Stimmen aus denselben Quellen schöpfen,
            eine andere Quelle zu sein. Nicht die einzige. Nicht die richtige. Nur eine andere.
          </p>

          <h2>Und ja: KI unterstützt</h2>
          <p>
            Das wäre unvollständig ohne einen Hinweis: Ja, KI wird als Werkzeug eingesetzt.
            Nicht als Ghostwriter und nicht als Meinungsersatz, sondern als Werkzeug — für
            Recherche, für das Formulieren und Verwerfen von Entwürfen, für technische
            Infrastruktur im Hintergrund.
          </p>
          <p>
            Der Massstab bleibt menschlich. Die Urteile, die Thesen, die Auswahl — das ist
            eine Person. Was in der Medienwelt zu Recht kritisiert wird, gilt auch hier:
            Transparenz ist besser als Verdecken. Wer KI nutzt und es nicht sagt, macht aus
            einem Werkzeug eine Täuschung. Das ist nicht die Methode von 9min.
          </p>

          <h2>Kontakt</h2>
          <p>
            <a href="mailto:hello@9min.ch">hello@9min.ch</a>
          </p>
          <p>
            Leserzuschriften sind willkommen — Hinweise, Kritik, Korrekturen, Themenvorschläge, Widerspruch.
            Wer höflich schreibt, bekommt eine höfliche Antwort. Wer Drohungen schickt, wird ignoriert. Wer
            den Namen herauszufinden versucht und glaubt, das sei eine besondere Leistung — viel Erfolg. Die
            Argumente werden dadurch nicht besser oder schlechter.
          </p>

        </div>
      </main>
      <Footer />
    </>
  )
}
