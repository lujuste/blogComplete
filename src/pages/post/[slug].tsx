import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import {FiCalendar, FiUser, FiClock} from 'react-icons/fi'
import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}



export default function Post({post, preview}: PostProps):JSX.Element {
const totalWords = post.data.content.reduce((total, contentItem) => {
  total += contentItem.heading.split(' ').length
  const words = contentItem.body.map(item => item.text.split(' ').length)
  words.map(word => (total += word))
  return total

 
}, 0)


console.log(totalWords)

const timeRead = Math.ceil(totalWords / 200)
  
  const router = useRouter();

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy', {
      locale: ptBR,
    }
  )

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <Header />
      <img src={post.data.banner.url} alt="imagem do post" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
            <div className={styles.headPost} >
                <h1>{post.data.title}</h1>
                <ul>
                      <li>
                        <FiCalendar />
                        {formattedDate}
                      </li>
                      <li>
                        <FiUser />
                        {post.data.author}
                      </li>
                      <li>
                        <FiClock />
                        {`tempo de leitura: ${timeRead} min`}
                      </li>
                    </ul>
            </div>
            {post.data.content.map(content => {
              return (
                <article key={content.heading}>
                    <h2>{content.heading}</h2>
                    <div
                      className={styles.postContent}
                      dangerouslySetInnerHTML={{ __html:
                      RichText.asHtml(content.body)}}
                      />    
                </article>
              )
            })}
            
        </div>  

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}    

      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts' )
  ]);

  const paths = posts.results.map(post => {
    return {
      params: { 
        slug: post.uid,
      }
    }
  })

  return { 
    paths,
    fallback: true
  }

  // TODO
};

export const getStaticProps: GetStaticProps = async ({
  params, preview = false, previewData
}) => {
  const prismic = getPrismicClient();
  const { slug } = params
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]  
        }
      })
    }  
  } 

  return {
    props: {
      post,
      preview,
    }
  }

};
