---
title: Automatiser la génération des carousels Linkedin
pubDate: 2024-10-05T12:00:00.000Z
description: Comment utiliser Docker, Pandoc, LaTeX pour générer des carousels pour linkedin
tags:
  - Docker
  - Automatisation
  - LaTeX
  - Pandoc
slug: 2024/10/05/automate-linkedin-carrousel
img: /assets/stock-3.jpg
img_alt: nice abstract image
lastModified: 2024-10-05T12:00:00.000Z
updateDate: 2024-10-05T12:00:00.000Z
draft: true
---

## Je n'aime pas Canvas

Oui, c'est un chouette outil, c'est vrai. Mais moi, je n'aime pas, à chaque fois que je veux partager un sujet, je passe du temps à copier-coller depuis mon markdown vers Canvas.
Donc, j'ai décidé de faire une "petite" automatisation.

Voici mon nouveau process pour générer des jolis carousels sur Linkedin, sans toucher autre chose qu'un terminal (avec NeoVim quand même... mais VsCode fera l'affaire):

- Ecrire un markdown
- Lancer un script
- Publier le PDF

## Pré-requis

Il faut avoir :

- un container Engine (Docker, ou autres)
- une belle photo de vous au format carré (650x650 par exemple)
- le plus beau logo de la terre

## Création du setup

### TL&DR (easy)

```bash
git clone https://github.com/EtienneDeneuve/linkedin-carousel-generator.git
cd linkedin-carousel-generator
docker build -t pandoc-custom-ubuntu -f ./Dockerfile . --progress=plain
docker run --rm -it \
    -v "$(pwd):/data" \
    pandoc-custom-ubuntu \
    "files/prez.md" -o "output/prez-ubu.pdf" \
    --pdf-engine=xelatex \
    --pdf-engine-opt=-shell-escape \
    --pdf-engine-opt=-interaction=nonstopmode \
    --template="templates/v2.tex"
# open the output/prez-ubu.pdf
```

### Je veux le faire moi-même

#### Créer les dossiers pour la structure

```bash
mkdir -p linkedin-generator/{data/fonts,files,output,templates}
```

Ajouter votre photos dans `data` :

- me.png (une photo de vous)
- logo-with-decors.png (votre joli logo)

Ajouter vos fonts personnalisées si besoin dans `data/fonts`.

#### Image Docker

Il faut customiser l'image pandoc `ubuntu` pour ajouter des modules LaTeX complémentaire :

```dockerfile
FROM pandoc/latex:latest-ubuntu

# Installer les packages
RUN apt-get update && \
    apt-get install -y \
        python3-pygments \
        texlive-latex-recommended \
        texlive-latex-extra \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-science \
        fonts-freefont-ttf && \
    rm -rf /var/lib/apt/lists/*

# Générer les formats nécessaires pour les moteurs TeX installés
RUN fmtutil-sys --byfmt pdflatex
RUN fmtutil-sys --byfmt xelatex

# Mettre à jour tlmgr sans exécuter les actions associées
RUN tlmgr update --self --all --no-execute-actions

# Installer les dépendances pour que le template puisse fonctionner
RUN tlmgr install \
        adjustbox \
        enumitem \
        fvextra \
        lineno \
        mdframed \
        minted \
        ragged2e \
        titlesec \
        wrapfig \
        fvextra

# Copier les polices personnalisées (optionnel)
# Si vous avez des polices spécifiques, vous pouvez les copier dans l'image
ADD data/fonts/* /usr/share/fonts/truetype/custom/

# Mettre à jour le cache des polices
RUN fc-cache -f -v
```

Builder cette image, `docker build -t pandoc-custom .`

### Preparer le template LaTeX

Bon, on va pas se mentir, on est entre nous, le LaTeX ce n'est pas hyper sexy, par contre c'est (vraiement) super puissant.

Je vous donne mon template, libre à vous de le customiser ;)

```latex
\documentclass{article}

% ici, on active la partie "syntax" highlight
$if(highlighting-macros)$
$highlighting-macros$
$endif$


% Encodage et polices
\usepackage[utf8]{inputenc}
\usepackage{fontspec}
\setmainfont{Dosis} % Vous pouvez changer la police si nécessaire

% Packages requis
\usepackage{graphicx}
\usepackage{geometry}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{xcolor}
\usepackage{tikz}
\usetikzlibrary{calc, backgrounds, shapes.arrows, shadows}
\usepackage{wrapfig}
\usepackage{ragged2e} % Pour l'alignement du texte
\usepackage{fvextra}
\usepackage{adjustbox} % Pour ajuster les images dans TikZ
\usepackage[cache=true]{minted}
\usepackage[unicode]{hyperref} % Charger hyperref ici


% Configuration de la géométrie de la page
\geometry{
    paperwidth=210mm,
    paperheight=210mm,
    margin=20mm,
    tmargin=1mm
}

% Définition des couleurs personnalisées
\definecolor{MainDark}{HTML}{105263}
\definecolor{Main}{HTML}{1a7996}
\definecolor{MainLight}{HTML}{96e0fd}
\definecolor{BcBackground}{HTML}{32809c}
\definecolor{SecondaryDark}{HTML}{7b9c35}
\definecolor{SecondaryLight}{HTML}{a3ce46}
\definecolor{AccentDark}{HTML}{07a6a0}
\definecolor{AccentLight}{HTML}{09d8d2}

% Changer la couleur de fond en MainDark
\pagecolor{MainDark}

% Configuration des en-têtes et pieds de page
\pagestyle{fancy}
\fancyhf{} % Effacer les en-têtes et pieds de page par défaut

% En-tête avec le logo centré
\fancyhead[C]{%
    \includegraphics[width=12cm]{data/logo-with-decors.png}
}

% Supprimer la ligne horizontale sous l'en-tête
\renewcommand{\headrulewidth}{0pt}

% Ajuster l'espace entre l'en-tête et le corps
\setlength{\headsep}{5cm}

% Pied de page avec nom à gauche et flèche à droite
\fancyfoot[L]{%
    \begin{tikzpicture}[remember picture, overlay]
        % Photo de l'auteur dans un masque rond
        \node[anchor=south west, xshift=1cm, yshift=2cm] at (current page.south west) {%
            \begin{tikzpicture}
                \draw[AccentLight, line width=1pt, drop shadow] (0,0) circle (1cm);
                \clip (0,0) circle (1cm);
                \node[anchor=center, inner sep=0pt] at (0,0) {\includegraphics[width=2cm]{data/me.png}};
            \end{tikzpicture}
        };
        % Nom de l'auteur et de l'entreprise
        \node[anchor=south west, xshift=3.2cm, yshift=2.8cm] at (current page.south west) {%
            \begin{minipage}{5cm}
                \raggedright
                \small \textbf{$author$}\\
                \small $company$
            \end{minipage}
        };
    \end{tikzpicture}
}
\fancyfoot[R]{%
    \begin{tikzpicture}[remember picture, overlay]
        % Flèche à droite
        \node[anchor=south east, xshift=-1cm, yshift=2cm] at (current page.south east) {%
            %\includegraphics[height=1cm]{data/arrow.png}
            \begin{tikzpicture}
                \node[
                    single arrow,
                    draw=none,
                    fill=MainLight,
                    minimum width=1.5cm,
                    minimum height=3cm,
                    single arrow head extend=0.5cm,
                    anchor=west,
                    drop shadow
                ] at (0,0) {};
            \end{tikzpicture}
           };
    \end{tikzpicture}
}

% Configuration des titres
\titleformat{\section}{
    \fontsize{42pt}{50pt}\bfseries\color{AccentLight}\centering
}{}{0pt}{}

% Configuration du corps de texte
\renewcommand{\normalsize}{\fontsize{18pt}{22pt}\selectfont}

% Alignement du texte à droite
\let\oldsection\section
\renewcommand{\section}[1]{%
    \oldsection{#1}
    \raggedright % Commence l'alignement à droite
}

% Définition de \tightlist si nécessaire
\providecommand{\tightlist}{
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}
}

% Charger hyperref en dernier
\usepackage[unicode]{hyperref}
\color{MainLight}

\begin{document}

$body$

\end{document}
```

Sauvegarder le dans le dossier `templates`, avec un nom comme par exemple `carousel.tex`.

### Ecrire un markdown

````markdown
---
<!-- cette partie permets d'injecter des variables dans le template LaTeX -->
author: Etienne Deneuve
company: www.simplified.fr
---

# J'aime pas Canvas

Oui, c'est un chouette outil, mais, moi je n'aime pas...

<!-- ce tag permet de passer à la page suivante -->

\newpage

# Comment faire sans ?

- Ecrire un markdown
- Lancer un script
- Publier le PDF

\newpage

# Docker, Pandoc, LaTex

<!-- Attention, le plugin ne sait pas casser les lignes nativement -->
<!-- Je n'ai pas encore trouver une façon de le gérer, mais j'y reviendrais -->

```bash
docker run --rm -it \
  -v "$(pwd):/data" \
  pandoc-custom \
  "files/prez.md" -o "output/prez.pdf" \
  --pdf-engine=xelatex \
  --pdf-engine-opt=-interaction=nonstopmode \
  --template="templates/v2.tex"
```
````

Sauvegarder le dans `files/prez.md` par exemple.

#### Lancer la conversion

Vérifier vos noms de fichiers ;)

```bash
export sourceMd="files/prez.md"
export destinationPdf="output/prez.pdf"
export templateTex="templates/v2.tex"
docker run --rm -it \
  -v "$(pwd):/data" \
  pandoc-custom \
  "${sourceMd}" -o "${destinationPdf}" \
  --pdf-engine=xelatex \
  --pdf-engine-opt=-interaction=nonstopmode \
  --template="${templateTex}"
```
