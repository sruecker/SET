// Upgrade NOTE: replaced 'PositionFog()' with multiply of UNITY_MATRIX_MVP by position
// Upgrade NOTE: replaced 'V2F_POS_FOG' with 'float4 pos : SV_POSITION'
// Upgrade NOTE: replaced '_PPLAmbient' with 'UNITY_LIGHTMODEL_AMBIENT'

Shader "Alpha/DiffuseZ" {
Properties {
    _Color ("Main Color", Color) = (1,1,1,1)
    _MainTex ("Base (RGB) Trans (A)", 2D) = "white" {}
}

Category {
    Lod 0
    Tags {Queue=Transparent}
    Alphatest Greater 0
    ZWrite On
    ColorMask RGB
    
    // ------------------------------------------------------------------
    // ARB fragment program
    
    #warning Upgrade NOTE: SubShader commented out; uses Unity 2.x style fixed function per-pixel lighting. Per-pixel lighting is not supported without shaders anymore.
/*SubShader {
        // Ambient pass
        Pass {
            Name "BASE"
            Tags {"LightMode" = "Always" /* Upgrade NOTE: changed from PixelOrNone to Always */}
            Fog { Color [_AddFog] }
            Blend SrcAlpha OneMinusSrcAlpha
            Color [_PPLAmbient]
            SetTexture [_MainTex] {constantColor [_Color] Combine texture * primary DOUBLE, texture * primary}
        }
        // Vertex lights
        Pass { 
            Name "BASE"
            Tags {"LightMode" = "Vertex"}
            Fog { Color [_AddFog] }
            Blend SrcAlpha OneMinusSrcAlpha
            Lighting On
            Material {
                Diffuse [_Color]
                Emission [_PPLAmbient]
            } 
            SetTexture [_MainTex] {combine texture * primary DOUBLE, texture * primary}
        }
        // Pixel lights
        Pass {  
            Name "PPL"
            Tags {
                "LightMode" = "Pixel"
                "LightTexCount" = "012"
            }
            Blend SrcAlpha One
            Fog { Color [_AddFog] }

CGPROGRAM
// profiles arbfp1
// fragment frag
// vertex vert
// autolight 7
#include "UnityCG.cginc"
#include "AutoLight.cginc"
// fragmentoption ARB_fog_exp2
// fragmentoption ARB_precision_hint_fastest

struct v2f {
    float4 pos : SV_POSITION;
    float2  uv            : TEXCOORD0;
    float3  normal        : TEXCOORD1;
    float3  lightDir  : TEXCOORD2;
    V2F_LIGHT_COORDS(TEXCOORD3);
};
struct v2f2 { 
    float4 pos : SV_POSITION;
    float2  uv            : TEXCOORD0;
    float3  normal        : TEXCOORD1;
    float3  lightDir  : TEXCOORD2;
};

v2f vert (appdata_base v)
{
    v2f o;
    o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
    o.normal = v.normal;
    o.uv = TRANSFORM_UV(0);
    o.lightDir = ObjSpaceLightDir( v.vertex );  
    PASS_LIGHT_COORDS(1);
    return o;
}

uniform sampler2D _MainTex : register(s0);
uniform float4 _Color;

float4 frag (v2f2 i, LIGHTDECL(TEXUNIT1))  : COLOR
{
    half4 texcol = tex2D( _MainTex, i.uv ); 
    half4 c = DiffuseLight( i.lightDir, i.normal, texcol, LIGHTATT );
    c.a = texcol.a * _Color.a;
    return c;
}
ENDCG

            SetTexture [_MainTex] {combine texture}
            SetTexture [_LightTexture0] {combine texture}
            SetTexture [_LightTextureB0] {combine texture}
        }
    }*/
    
    // ------------------------------------------------------------------
    // GeForce 3/4Ti
    
    #warning Upgrade NOTE: SubShader commented out; uses Unity 2.x style fixed function per-pixel lighting. Per-pixel lighting is not supported without shaders anymore.
/*SubShader {
        TexCount 4    // Get Geforce2s to ignore this shader
        // Ambient pass
        Pass {
            Tags {"LightMode" = "Always" /* Upgrade NOTE: changed from PixelOrNone to Always */}
            Fog {  Color [_AddFog] }
            Blend SrcAlpha OneMinusSrcAlpha
            Color [_PPLAmbient]
            SetTexture [_MainTex] {constantColor [_Color] Combine texture * primary DOUBLE, texture * primary}
        }
        Pass { 
            Tags {"LightMode" = "Vertex"} 
            Fog {  Color [_AddFog] }
            Blend SrcAlpha OneMinusSrcAlpha
            Material {
                Diffuse [_Color]
                Emission [_PPLAmbient]
            } 
            Lighting On
            SetTexture [_MainTex] {Combine texture * primary DOUBLE, texture * primary}
        }
        Pass {  
            Name "PPL"
            Tags { 
                "LightMode" = "Pixel" 
            }
            Blend SrcAlpha One
            Fog { Color [_AddFog] }
            Material { Diffuse [_Color] }
            Lighting On

CGPROGRAM
// autolight 7
// profiles fp20
// fragment
// fragmentoption ARB_fog_exp2
// fragmentoption ARB_precision_hint_fastest

#include "UnityCG.cginc"
#include "AutoLight.cginc"

struct v2f { 
    float4 hPosition    : POSITION;
    float4 uv: TEXCOORD0;
};  

uniform sampler2D _MainTex;
uniform float4 _SpecColor;

half4 main (v2f i, LIGHTDECL (TEXUNIT1)) : COLOR  {
    half4 temp = {1,1,0,0};
    temp = tex2D (_MainTex, i.uv.xy); 
    temp.xyz *= LIGHTCOLOR + UNITY_LIGHTMODEL_AMBIENT.xyz; 
    temp.xyz *= 2;
    temp.w *= _LightColor.a;
    return temp;
} 
ENDCG

            SetTexture[_MainTex] {combine texture * primary DOUBLE}
            SetTexture[_LightTexture0] {combine previous * texture alpha} 
            SetTexture[_LightTextureB0] {combine previous}
        }
    }*/

    // ------------------------------------------------------------------
    // Radeon 9000

    #warning Upgrade NOTE: SubShader commented out because of manual shader assembly
/*SubShader {
        // Ambient pass
        Pass {
            Blend SrcAlpha OneMinusSrcAlpha
            Name "BASE"
            Tags {"LightMode" = "Always" /* Upgrade NOTE: changed from PixelOrNone to Always */}
            Color [_PPLAmbient]
            SetTexture [_MainTex] {constantColor [_Color] Combine texture * primary DOUBLE, texture * constant}
        }
        // Vertex lights
        Pass { 
            Blend SrcAlpha OneMinusSrcAlpha
            Name "BASE"
            Tags {"LightMode" = "Vertex"}
            Lighting On
            Material {
                Diffuse [_Color]
                Emission [_PPLAmbient]
            }
            SetTexture [_MainTex] {Combine texture * primary DOUBLE, texture * primary}
        }
        
        // Pixel lights with 0 light textures
        Pass { 
            Blend SrcAlpha One
            Name "PPL"
            Tags { 
                "LightMode" = "Pixel" 
                "LightTexCount" = "0"
            }

CGPROGRAM
// vertex vert
#include "UnityCG.cginc"

struct v2f {
    float4 pos : SV_POSITION;
    float2 uv      : TEXCOORD0;
    float3 normal   : TEXCOORD1;
    float3 lightDir : TEXCOORD2;
};

v2f vert(appdata_base v)
{
    v2f o;
    o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
    o.normal = v.normal;
    o.uv = TRANSFORM_UV(0);
    o.lightDir = ObjSpaceLightDir( v.vertex );
    return o; 
}
ENDCG
            Program "" {
                SubProgram {
                    Local 0, [_ModelLightColor0]
                    Local 1, [_Color]

"!!ATIfs1.0
StartConstants;
    CONSTANT c0 = program.local[0];
    CONSTANT c1 = program.local[1];
EndConstants;

StartOutputPass;
    SampleMap r0, t0.str;         # main texture
    SampleMap r1, t2.str;         # normalized light dir
    PassTexCoord r2, t1.str;        # normal
    
    DOT3 r5.sat, r2, r1.2x.bias;    # R5 = diffuse (N.L)
    
    MUL r0.rgb, r0, r5;
    MUL r0.rgb.2x, r0, c0;
    MUL r0.a, r0, c1;
EndPass; 
"
                }
            }
            SetTexture[_MainTex] {combine texture}
            SetTexture[_CubeNormalize] {combine texture}
        }
        
        // Pixel lights with 1 light texture
        Pass {
            Blend SrcAlpha One
            Name "PPL"
            Tags { 
                "LightMode" = "Pixel" 
                "LightTexCount" = "1"
            }

CGPROGRAM
// vertex vert
#include "UnityCG.cginc"

struct v2f {
    float4 pos : SV_POSITION;
    float2 uv      : TEXCOORD0;
    float3 normal   : TEXCOORD1;
    float3 lightDir : TEXCOORD2;
    float4 LightCoord0 : TEXCOORD3;
};

v2f vert(appdata_tan v)
{
    v2f o;
    o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
    o.normal = v.normal;
    o.uv = TRANSFORM_UV(0);
    o.lightDir = ObjSpaceLightDir( v.vertex );
    
    o.LightCoord0 = LIGHT_COORD(2);
    
    return o; 
}
ENDCG
            Program "" {
                SubProgram {
                    Local 0, [_ModelLightColor0]
                    Local 1, [_Color]

"!!ATIfs1.0
StartConstants;
    CONSTANT c0 = program.local[0];
    CONSTANT c1 = program.local[1];
EndConstants;

StartOutputPass;
    SampleMap r0, t0.str;         # main texture
    SampleMap r1, t2.str;         # normalized light dir
    PassTexCoord r4, t1.str;        # normal
    SampleMap r2, t3.str;         # a = attenuation
    
    DOT3 r5.sat, r4, r1.2x.bias;    # R5 = diffuse (N.L)
    
    MUL r0.rgb, r0, r5;
    MUL r0.rgb.2x, r0, c0;
    MUL r0.rgb, r0, r2.a;         # attenuate
    MUL r0.a, r0, c1;
EndPass; 
"
                }
            }
            SetTexture[_MainTex] {combine texture}
            SetTexture[_CubeNormalize] {combine texture}
            SetTexture[_LightTexture0] {combine texture}
        }
        
        // Pixel lights with 2 light textures
        Pass {
            Blend SrcAlpha One
            Name "PPL"
            Tags {
                "LightMode" = "Pixel"
                "LightTexCount" = "2"
            }
CGPROGRAM
// vertex vert
#include "UnityCG.cginc"

struct v2f {
    float4 pos : SV_POSITION;
    float2 uv      : TEXCOORD0;
    float3 normal   : TEXCOORD1;
    float3 lightDir : TEXCOORD2;
    float4 LightCoord0 : TEXCOORD3;
    float4 LightCoordB0 : TEXCOORD4;
};

v2f vert(appdata_tan v)
{
    v2f o;
    o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
    o.normal = v.normal;
    o.uv = TRANSFORM_UV(0);
    o.lightDir = ObjSpaceLightDir( v.vertex );
    
    o.LightCoord0 = LIGHT_COORD(2);
    o.LightCoordB0 = LIGHT_COORD(3);
    
    return o; 
}
ENDCG
            Program "" {
                SubProgram {
                    Local 0, [_ModelLightColor0]
                    Local 1, [_Color]

"!!ATIfs1.0
StartConstants;
    CONSTANT c0 = program.local[0];
    CONSTANT c1 = program.local[1];
EndConstants;

StartOutputPass;
    SampleMap r0, t0.str;         # main texture
    SampleMap r1, t2.str;         # normalized light dir
    PassTexCoord r4, t1.str;        # normal
    SampleMap r2, t3.stq_dq;        # a = attenuation 1
    SampleMap r3, t4.stq_dq;        # a = attenuation 2
    
    DOT3 r5.sat, r4, r1.2x.bias;    # R5 = diffuse (N.L)
    
    MUL r0.rgb, r0, r5;
    MUL r0.rgb.2x, r0, c0;
    MUL r0.rgb, r0, r2.a;         # attenuate
    MUL r0.rgb, r0, r3.a;
    MUL r0.a, r0, c1;
EndPass; 
"
                }
            }
            SetTexture[_MainTex] {combine texture}
            SetTexture[_CubeNormalize] {combine texture}
            SetTexture[_LightTexture0] {combine texture}
            SetTexture[_LightTextureB0] {combine texture}
        }
    }*/
    
    // ------------------------------------------------------------------
    // Radeon 7000
    
    Category {
        Material {
            Diffuse [_Color]
            Emission [_PPLAmbient]
        }
        Lighting On
        Fog { Color [_AddFog] }
        #warning Upgrade NOTE: SubShader commented out; uses Unity 2.x style fixed function per-pixel lighting. Per-pixel lighting is not supported without shaders anymore.
/*SubShader {
            Pass {
                Blend SrcAlpha OneMinusSrcAlpha
                Name "BASE"
                Tags {"LightMode" = "Always" /* Upgrade NOTE: changed from PixelOrNone to Always */}
                Color [_PPLAmbient]
                Lighting Off
                SetTexture [_MainTex] {Combine texture * primary DOUBLE}
                SetTexture [_MainTex] {Combine texture * primary DOUBLE}
                SetTexture [_MainTex] {Combine texture * primary DOUBLE, primary * texture}
            }
            Pass {  
                Blend SrcAlpha OneMinusSrcAlpha
                Name "BASE"
                Tags {"LightMode" = "Vertex"}
                SetTexture [_MainTex] {Combine texture * primary DOUBLE, primary * texture}
            }
            Pass {
                Blend SrcAlpha One
                Name "PPL"
                Tags {
                    "LightMode" = "Pixel"
                    "LightTexCount" = "2"
                }
                SetTexture [_LightTexture0]     { combine previous * texture alpha, previous }
                SetTexture [_LightTextureB0]    {
                    combine previous * texture alpha + constant, previous
                    constantColor [_PPLAmbient]
                }
                SetTexture [_MainTex]   { combine previous * texture DOUBLE, primary * texture}
            }
            Pass {
                Blend SrcAlpha One
                Name "PPL"
                Tags {
                    "LightMode" = "Pixel"
                    "LightTexCount"  = "1"
                }
                SetTexture [_LightTexture0] {
                    combine previous * texture alpha + constant, previous
                    constantColor [_PPLAmbient]
                }
                SetTexture [_MainTex]   { combine previous * texture DOUBLE, primary * texture}
            }
            Pass {
                Blend SrcAlpha One
                Name "PPL"
                Tags {
                    "LightMode" = "Pixel"
                    "LightTexCount"  = "0"
                }
                SetTexture [_MainTex]   { combine previous * texture DOUBLE, primary * texture}
            }
        }*/
    }
}

// Fallback to Alpha Vertex Lit
Fallback "Alpha/VertexLit", 2

}
