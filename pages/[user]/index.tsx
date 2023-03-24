"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import { useDocument } from "@/firebase/firestore/getDocument"
import { useDocuments } from "@/firebase/firestore/getDocuments"
import delinearizeCode from "@/utils/delinearizeCode"
import indentCode from "@/utils/indentCode"
import { Copy, Github, Loader2, Star, Verified } from "lucide-react"
import Prism from "prismjs"
import toast, { Toaster } from "react-hot-toast"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

import { ToastAction } from "@/components/ui/toast"
import "prism-themes/themes/prism-one-dark.min.css"
import { useSearchParams } from "next/navigation"
import { useGetIsPrivateCodeFromUser } from "@/firebase/firestore/getIsPrivateCodeFromUser"
import moment from "moment"

import { siteConfig } from "@/config/site"
import CardCode from "@/components/card-code"
import Error from "@/components/error"
import { Layout } from "@/components/layout"
import Loader from "@/components/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"

export default function User() {
  const searchParams = useSearchParams()

  const { data, isLoading, isError } = useDocument(
    searchParams.get("user"),
    "users"
  )

  const {
    isLoading: isLoadingPublicCodes,
    isError: isErrorPublicCodes,
    data: dataPublicCodes,
  } = useGetIsPrivateCodeFromUser(false, searchParams.get("user"))

  return (
    <Layout>
      <Head>
        <title>Sharuco</title>
        <meta
          name="description"
          content="Sharuco allows you to share code snippets that you have found
           useful."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
        {isLoading && <Loader />}
        {data && data.exists && (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-40 w-40 cursor-pointer">
              <AvatarImage
                src={data.data.photoURL}
                alt={data.data.displayName}
              />
              <AvatarFallback>{data.data.displayName}</AvatarFallback>
            </Avatar>
            <div className="mb-8 flex flex-col items-center gap-2">
              <div className="flex items-center gap-0">
                <h1 className="text-4xl font-bold">{data.data.displayName}</h1>
                <span className="ml-2">
                  {data.data.isCertified && (
                    <Verified className="h-6 w-6 text-green-500" />
                  )}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-center text-gray-500">
                  Joined{" "}
                  <span className="font-bold">
                    {moment(data.data.createdAt).format("DD MMMM YYYY")}
                  </span>
                </p>
                <p className="text-center text-gray-500">
                  Last seen{" "}
                  <span className="font-bold">
                    {moment(data.data.lastLoginAt).format("DD MMMM YYYY")}
                  </span>
                </p>
              </div>
            </div>
            {isLoadingPublicCodes && <Loader />}
            {dataPublicCodes && (
              <>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                  className="w-full"
                >
                  <Masonry gutter="1rem">
                    {dataPublicCodes
                      .sort((a, b) => {
                        return moment(b.createdAt).diff(moment(a.createdAt))
                      })
                      .map(
                        (code: {
                          id: string
                          idAuthor: string
                          language: string
                          code: string
                          description: string
                          tags: string[]
                          favoris: string[]
                        }) => (
                          <CardCode
                            key={code.id}
                            id={code.id}
                            idAuthor={code.idAuthor}
                            language={code.language}
                            code={code.code}
                            description={code.description}
                            tags={code.tags}
                            favoris={code.favoris}
                          />
                        )
                      )}
                  </Masonry>
                </ResponsiveMasonry>
                {dataPublicCodes.length == 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-bold">
                      This user has not shared any code yet
                    </h1>
                  </div>
                )}
              </>
            )}
            {isErrorPublicCodes && <Error />}
          </div>
        )}
        {data && !data.exists && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="tesxt-4xl font-bold">User not found</h1>
            <Link
              href="/"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Go back to home
            </Link>
          </div>
        )}
        {isError && <Error />}
      </section>
    </Layout>
  )
}
