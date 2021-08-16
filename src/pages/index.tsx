/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/self-closing-comp */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prettier/prettier */

import Link from 'next/link'
import { GetStaticProps } from 'next';
import {FiCalendar, FiUser} from 'react-icons/fi'
import Prismic from '@prismicio/client'
import Head from 'next/head'
// eslint-disable-next-line no-use-before-define
import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns'
import  ptBR from 'date-fns/locale/pt-BR'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({postsPagination, preview}: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {  
        locale: ptBR,
      })
    }
  })
  
  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPost, setNextPost] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)

  async function handlePagination(): Promise<void> { 
    if(currentPage !== 1 && nextPost === null) {
      return;
    }
    
    const postsProps = await fetch(`${nextPost}`)
    .then(response => response.json())

    setNextPost(postsProps.next_page)
    setCurrentPage(postsProps.page)

    const newPosts = postsProps.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPosts([...posts, ...newPosts])

  }
  

  return (
    <>
    <Head>
      <title>Home | spacetraveling</title>
    </Head>
    <main className={commonStyles.container}>
      <Header />

        <div className={styles.posts}>
            {posts.map(post => (  
                  <Link href={`/post/${post.uid}`} key={post.uid}>
                  <a className={styles.post}>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <ul>
                      <li>
                        <FiCalendar />
                        {post.first_publication_date}
                      </li>
                      <li>
                        <FiUser />
                        {post.data.author}
                      </li>
                    </ul>
                  </a>
                </Link>
                ))}

                {nextPost && (
                  <button
                  type="button"
                  onClick={handlePagination}>
                    Carregar mais posts</button>
                )}
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

export const getStaticProps: GetStaticProps = async ({preview = false}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')], {
      pageSize: 1,
    }
  );
    
    const posts = postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    console.log(posts)

    const postsPagination = {
      next_page: postsResponse.next_page,
      results: posts,
    }

  return {
    props: {
      postsPagination,
      preview
    }
  }

  
 

  // TODO
};
